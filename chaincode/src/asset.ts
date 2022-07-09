/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public AssetType: "cocoabag" | "chocolatebar";

    @Property()
    public ID: string;

    @Property()
    public Refs: string;

    @Property()
    public Data: string;

}
