/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { CocoaBag, CocoaBagStateEnum } from './cocoa-bag';

@Info({ title: 'CocoaSupplyChainContract', description: 'My Smart Contract' })
export class CocoaSupplyChainContract extends Contract {

    constructor() {
        super('CocoaSupplyChainContract');
    }

    @Transaction(false)
    @Returns('boolean')
    public async cocoaBagExists(ctx: Context, cocoaBagId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(cocoaBagId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createCocoaBag(ctx: Context, cocoaBagId: string, cb: string): Promise<void> {
        const exists: boolean = await this.cocoaBagExists(ctx, cocoaBagId);
        var cocoaBag = JSON.parse(cb) as CocoaBag;
        if (exists) {
            throw new Error(`The asset ${cocoaBagId} already exists`);
        }
        if(cocoaBag.state != CocoaBagStateEnum.Produced) {
          throw new Error(`The state is not correct`);
        }
        const buffer: Buffer = Buffer.from(cb);
        await ctx.stub.putState(cocoaBagId, buffer);
    }

    @Transaction(false)
    @Returns('CocoaBag')
    public async readCocoaBag(ctx: Context, cocoaBagId: string): Promise<CocoaBag> {
        const exists: boolean = await this.cocoaBagExists(ctx, cocoaBagId);
        if (!exists) {
            throw new Error(`The asset ${cocoaBagId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(cocoaBagId);
        const cocoaBag: CocoaBag = JSON.parse(data.toString()) as CocoaBag;
        return cocoaBag;
    }

    @Transaction()
    public async updateCocoaBag(ctx: Context, cocoaBagId: string, cb: string): Promise<void> {
        const exists: boolean = await this.cocoaBagExists(ctx, cocoaBagId);
        var cocoaBag = JSON.parse(cb) as CocoaBag;
        if (cocoaBag.weight == null || cocoaBag.state == null) {
          throw new Error(`Incomplete data`);
        }
        if (!exists) {
            throw new Error(`The asset ${cocoaBagId} does not exist`);
        }
        const buffer: Buffer = Buffer.from(cb);
        await ctx.stub.putState(cocoaBagId, buffer);
    }

    @Transaction()
    public async deleteCocoaBag(ctx: Context, cocoaBagId: string): Promise<void> {
        const exists: boolean = await this.cocoaBagExists(ctx, cocoaBagId);
        if (!exists) {
            throw new Error(`The asset ${cocoaBagId} does not exist`);
        }
        await ctx.stub.deleteState(cocoaBagId);
    }

}
