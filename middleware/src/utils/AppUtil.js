"use strict";
/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyJSONString = exports.buildWallet = exports.buildCCPOrg1 = void 0;
const fabric_network_1 = require("fabric-network");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const buildCCPOrg1 = () => {
    // load the common connection configuration file
    const ccpPath = path_1.default.resolve(__dirname, "../../stores/connectionprofiles/enpalpeers.json");
    const fileExists = fs_1.default.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs_1.default.readFileSync(ccpPath, 'utf8');
    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);
    console.log(`Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};
exports.buildCCPOrg1 = buildCCPOrg1;
const buildWallet = (walletPath) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a new  wallet : Note that wallet is for managing identities.
    let wallet;
    if (walletPath) {
        wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    }
    return wallet;
});
exports.buildWallet = buildWallet;
const prettyJSONString = (inputString) => {
    if (inputString) {
        return JSON.stringify(JSON.parse(inputString), null, 2);
    }
    else {
        return inputString;
    }
};
exports.prettyJSONString = prettyJSONString;
