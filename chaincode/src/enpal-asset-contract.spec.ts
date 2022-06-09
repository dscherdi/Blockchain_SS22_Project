/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { EnpalAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('EnpalAssetContract', () => {

    let contract: EnpalAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new EnpalAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"enpal asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"enpal asset 1002 value"}'));
    });

    describe('#enpalAssetExists', () => {

        it('should return true for a enpal asset', async () => {
            await contract.enpalAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a enpal asset that does not exist', async () => {
            await contract.enpalAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createEnpalAsset', () => {

        it('should create a enpal asset', async () => {
            await contract.createEnpalAsset(ctx, '1003', 'enpal asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"enpal asset 1003 value"}'));
        });

        it('should throw an error for a enpal asset that already exists', async () => {
            await contract.createEnpalAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The enpal asset 1001 already exists/);
        });

    });

    describe('#readEnpalAsset', () => {

        it('should return a enpal asset', async () => {
            await contract.readEnpalAsset(ctx, '1001').should.eventually.deep.equal({ value: 'enpal asset 1001 value' });
        });

        it('should throw an error for a enpal asset that does not exist', async () => {
            await contract.readEnpalAsset(ctx, '1003').should.be.rejectedWith(/The enpal asset 1003 does not exist/);
        });

    });

    describe('#updateEnpalAsset', () => {

        it('should update a enpal asset', async () => {
            await contract.updateEnpalAsset(ctx, '1001', 'enpal asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"enpal asset 1001 new value"}'));
        });

        it('should throw an error for a enpal asset that does not exist', async () => {
            await contract.updateEnpalAsset(ctx, '1003', 'enpal asset 1003 new value').should.be.rejectedWith(/The enpal asset 1003 does not exist/);
        });

    });

    describe('#deleteEnpalAsset', () => {

        it('should delete a enpal asset', async () => {
            await contract.deleteEnpalAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a enpal asset that does not exist', async () => {
            await contract.deleteEnpalAsset(ctx, '1003').should.be.rejectedWith(/The enpal asset 1003 does not exist/);
        });

    });

});
