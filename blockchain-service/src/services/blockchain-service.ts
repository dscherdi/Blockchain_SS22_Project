'use strict';

import { Contract, Gateway, Wallets, X509Identity } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import * as fs from 'fs';
import { CocoaBag } from '../models/cocoabag.model';

const path = require('path');

export class BlockchainClient {
  gateway: Gateway;
  contract: Contract;


  prettyJSONString(inputString: string) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
  }

  async connect() {
    try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', '..', 'connection-profile', 'connection-org1.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const identity = await wallet.get('appUser');
      if (!identity) {
        console.log('An identity for the user "appUser" does not exist in the wallet');
        console.log('Run the registerUser.ts application before retrying');
        await this.enrollAdmin();
        await this.registerUser();
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork('mychannel');

      // Get the contract from the network.
      this.contract = network.getContract('mycc');
    } catch (error) {
      console.error(`Failed to connect to chaincode: ${error}`);
    }
  }

  async disconnect() {
    await this.gateway.disconnect();
  }

  async createCocoaBag(id: string, value: string): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    try {
      var result = await this.contract.submitTransaction("createCocoaBag", id, value);
    } catch (e) {
      console.log("Function invoke failed" + e);
      throw new Error('Blockchain Service couldn`t invoke chaincode function: ' + e);
    }

    return result.toString();
  }

  async updateCocoaBagState(id: string, value: string): Promise<Boolean> {
    if (!this.contract) {
      await this.connect();
    }

    let result: boolean = false;
    try {
      await this.contract.submitTransaction("updateCocoaBagState", id, value);
      result = true;
    } catch (e) {
      console.log("Function invoke failed" + e);
      throw new Error('Blockchain Service couldn`t invoke chaincode function: ' + e);
    }

    return result;
  }

  async readCocoaBag(id: string): Promise<CocoaBag> {
    if (!this.contract) {
      await this.connect();
    }

    let asset: CocoaBag;
    try {
      const res = await this.contract.evaluateTransaction("readCocoaBag", id);
      asset = JSON.parse(res.toString()) as CocoaBag;
    } catch (e) {
      console.log("Function invoke failed" + e);
      throw new Error('Blockchain Service couldn`t invoke chaincode function: ' + e);
    }

    return asset;
  }

  async enrollAdmin() {
    try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', '..', 'connection-profile', 'connection-org1.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new CA client for interacting with the CA.
      const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
      const caTLSCACerts = caInfo.tlsCACerts.pem;
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the admin user.
      const identity = await wallet.get('admin');
      if (identity) {
        console.log('An identity for the admin user "admin" already exists in the wallet');
        return;
      }

      // Enroll the admin user, and import the new identity into the wallet.
      const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
      const x509Identity: X509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
      };
      await wallet.put('admin', x509Identity);
      console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
      console.error(`Failed to enroll admin user "admin": ${error}`);
      process.exit(1);
    }
  }

  async registerUser() {
    try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', '..', 'connection-profile', 'connection-org1.json');
      let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new CA client for interacting with the CA.
      const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
      const ca = new FabricCAServices(caURL);

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get('appUser');
      if (userIdentity) {
        console.log('An identity for the user "appUser" already exists in the wallet');
        return;
      }

      // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get('admin');
      if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        console.log('Run the enrollAdmin.ts application before retrying');
        return;
      }

      // build a user object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, 'admin');

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'appUser', role: 'client' }, adminUser);
      const enrollment = await ca.enroll({ enrollmentID: 'appUser', enrollmentSecret: secret });
      const x509Identity: X509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
      };
      await wallet.put('appUser', x509Identity);
      console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');

    } catch (error) {
      console.error(`Failed to register user "appUser": ${error}`);
      process.exit(1);
    }
  }
}

