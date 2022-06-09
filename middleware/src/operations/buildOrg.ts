import FabricCAServices from "fabric-ca-client";
import {
  Contract,
  DefaultEventHandlerStrategies,
  DefaultQueryHandlerStrategies,
  Gateway,
  Identity,
  Network,
  Wallet,
} from "fabric-network";
import { buildCCPOrg1, buildWallet } from "../utils/AppUtil";
import {
  buildCAClient,
  enrollAdmin,
  registerAndEnrollUser,
} from "../utils/CAUtil";
import chalk from "chalk";

export class Org {
  static ccp: any;
  static caClient: FabricCAServices;
  static wallet: Wallet;
  static gateway: Gateway;
  static mspOrg1 = "enpalpeers";
  static admin: Identity;
  static channel = "channel";
  static network: Network;
  static contract: Contract;
  static chaincodeName = "chaincode_16";

  static async init() {
    Org.ccp = buildCCPOrg1();
    Org.caClient = buildCAClient(Org.ccp, "enpalpeersCA");

    console.info(chalk.yellowBright("Building wallet..."));
    const walletPathOrg1 = "wallet/users";
    const w = await buildWallet(walletPathOrg1);
    if (w != undefined) {
      Org.wallet = w;
    } else {
      console.error(chalk.redBright("Wallet could not be build"));

      return;
    }
    console.info(chalk.greenBright("Wallet built"));

    console.info(chalk.yellowBright("Enrolling Admin..."));
    await Org.enrollAdmin();
    const adm = await Org.wallet.get("admin");
    if (adm != undefined) {
      Org.admin = adm;
    } else {
      console.error(chalk.redBright("Admin not found"));
      return;
    }
    console.info(chalk.greenBright("Admin enrolled"));

    try {
      Org.gateway = new Gateway();

      console.info(chalk.yellow("Connecting to gateway..."));
      //connect using Discovery enabled
      await Org.gateway.connect(Org.ccp, {
        eventHandlerOptions: {
          strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ANYFORTX,
          commitTimeout: 300000,
          endorseTimeout: 300000,
        },
        queryHandlerOptions: {
          strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_SINGLE,
          timeout: 300000,
        },
        wallet: Org.wallet,
        identity: Org.admin,
        discovery: { enabled: true, asLocalhost: false },
      });

      console.info(chalk.greenBright("Connected"));

      console.info(chalk.yellowBright("Getting network..."));
      Org.network = await Org.gateway.getNetwork(Org.channel);
      console.info(chalk.greenBright("Network obtained"));
      console.info(chalk.yellowBright("Obtaining contract..."));
      Org.contract = Org.network.getContract(
        Org.chaincodeName,
        Org.chaincodeName
      );
      console.info(chalk.greenBright("Contract obtained"));
    } catch (e) {
      console.error(e);
    }
  }

  static async invokeContractFunction(
   func: string, params: string[]
  ) {
    console.info(
      chalk.yellowBright`Invoking function ${
        func
      } and params ${JSON.stringify(params)}`
    );
    const response = await Org.contract.submitTransaction(func, ...params);
    console.info(
      chalk.blueBright`InvokeContractFunction got response: ${response.toString()}`
    );
    return response.toString();
  }

  static async enrollUser(id: string) {
    await registerAndEnrollUser(
      Org.caClient,
      Org.wallet,
      Org.mspOrg1,
      id,
      "enpalpeers"
    );
  }

  static async enrollAdmin() {
    await enrollAdmin(Org.caClient, Org.wallet, Org.mspOrg1);
  }
}
