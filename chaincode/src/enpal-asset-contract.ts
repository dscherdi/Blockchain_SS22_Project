/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { EnpalAsset } from './enpal-asset';

@Info({ title: 'EnpalAssetContract', description: 'My Smart Contract' })
export class EnpalAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async enpalAssetExists(ctx: Context, enpalAssetId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(enpalAssetId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createEnpalAsset(ctx: Context, enpalAssetId: string, value: string): Promise<void> {
        const exists: boolean = await this.enpalAssetExists(ctx, enpalAssetId);
        if (exists) {
            throw new Error(`The enpal asset ${enpalAssetId} already exists`);
        }
        const enpalAsset: EnpalAsset = new EnpalAsset();
        enpalAsset.value = value;
        const buffer: Buffer = Buffer.from(JSON.stringify(enpalAsset));
        await ctx.stub.putState(enpalAssetId, buffer);
    }

    @Transaction(false)
    @Returns('EnpalAsset')
    public async readEnpalAsset(ctx: Context, enpalAssetId: string): Promise<EnpalAsset> {
        const exists: boolean = await this.enpalAssetExists(ctx, enpalAssetId);
        if (!exists) {
            throw new Error(`The enpal asset ${enpalAssetId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(enpalAssetId);
        const enpalAsset: EnpalAsset = JSON.parse(data.toString()) as EnpalAsset;
        return enpalAsset;
    }

    @Transaction()
    public async updateEnpalAsset(ctx: Context, enpalAssetId: string, newValue: string): Promise<void> {
        const exists: boolean = await this.enpalAssetExists(ctx, enpalAssetId);
        if (!exists) {
            throw new Error(`The enpal asset ${enpalAssetId} does not exist`);
        }
        const enpalAsset: EnpalAsset = new EnpalAsset();
        enpalAsset.value = newValue;
        const buffer: Buffer = Buffer.from(JSON.stringify(enpalAsset));
        await ctx.stub.putState(enpalAssetId, buffer);
    }

    @Transaction()
    public async deleteEnpalAsset(ctx: Context, enpalAssetId: string): Promise<void> {
        const exists: boolean = await this.enpalAssetExists(ctx, enpalAssetId);
        if (!exists) {
            throw new Error(`The enpal asset ${enpalAssetId} does not exist`);
        }
        await ctx.stub.deleteState(enpalAssetId);
    }

}
