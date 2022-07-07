/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public AssetType: "cocoaBag" | "chocolateBar";

    @Property()
    public ID: string;

    @Property()
    public Type: string;

    @Property()
    public Weight: number;

    @Property()
    public FarmerName: string;

    @Property()
    public FarmLocation: string;

    @Property()
    public Price: string;

    @Property()
    public ProcessingFactory: string;

}
