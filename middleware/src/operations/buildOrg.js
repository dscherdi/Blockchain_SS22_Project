"use strict";
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
exports.Org = void 0;
const fabric_network_1 = require("fabric-network");
const AppUtil_1 = require("../utils/AppUtil");
const CAUtil_1 = require("../utils/CAUtil");
const chalk_1 = __importDefault(require("chalk"));
class Org {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            Org.ccp = AppUtil_1.buildCCPOrg1();
            Org.caClient = CAUtil_1.buildCAClient(Org.ccp, "enpalpeersCA");
            console.info(chalk_1.default.yellowBright("Building wallet..."));
            const walletPathOrg1 = "wallet/users";
            const w = yield AppUtil_1.buildWallet(walletPathOrg1);
            if (w != undefined) {
                Org.wallet = w;
            }
            else {
                console.error(chalk_1.default.redBright("Wallet could not be build"));
                return;
            }
            console.info(chalk_1.default.greenBright("Wallet built"));
            console.info(chalk_1.default.yellowBright("Enrolling Admin..."));
            yield Org.enrollAdmin();
            const adm = yield Org.wallet.get("admin");
            if (adm != undefined) {
                Org.admin = adm;
            }
            else {
                console.error(chalk_1.default.redBright("Admin not found"));
                return;
            }
            console.info(chalk_1.default.greenBright("Admin enrolled"));
            try {
                Org.gateway = new fabric_network_1.Gateway();
                console.info(chalk_1.default.yellow("Connecting to gateway..."));
                //connect using Discovery enabled
                yield Org.gateway.connect(Org.ccp, {
                    eventHandlerOptions: {
                        strategy: fabric_network_1.DefaultEventHandlerStrategies.MSPID_SCOPE_ANYFORTX,
                        commitTimeout: 300000,
                        endorseTimeout: 300000,
                    },
                    queryHandlerOptions: {
                        strategy: fabric_network_1.DefaultQueryHandlerStrategies.MSPID_SCOPE_SINGLE,
                        timeout: 300000,
                    },
                    wallet: Org.wallet,
                    identity: Org.admin,
                    discovery: { enabled: true, asLocalhost: false },
                });
                console.info(chalk_1.default.greenBright("Connected"));
                console.info(chalk_1.default.yellowBright("Getting network..."));
                Org.network = yield Org.gateway.getNetwork(Org.channel);
                console.info(chalk_1.default.greenBright("Network obtained"));
                console.info(chalk_1.default.yellowBright("Obtaining contract..."));
                Org.contract = Org.network.getContract(Org.chaincodeName, Org.chaincodeName);
                console.info(chalk_1.default.greenBright("Contract obtained"));
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    static invokeContractFunction(func, params) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(chalk_1.default.yellowBright `Invoking function ${func} and params ${JSON.stringify(params)}`);
            const response = yield Org.contract.submitTransaction(func, ...params);
            console.info(chalk_1.default.blueBright `InvokeContractFunction got response: ${response.toString()}`);
            return response.toString();
        });
    }
    static enrollUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield CAUtil_1.registerAndEnrollUser(Org.caClient, Org.wallet, Org.mspOrg1, id, "enpalpeers");
        });
    }
    static enrollAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            yield CAUtil_1.enrollAdmin(Org.caClient, Org.wallet, Org.mspOrg1);
        });
    }
}
exports.Org = Org;
Org.mspOrg1 = "enpalpeers";
Org.channel = "channel";
Org.chaincodeName = "chaincode_16";
