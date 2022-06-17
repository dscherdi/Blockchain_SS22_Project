/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

export enum CocoaBagStateEnum {
  Produced = "produced", 
  Packaged = "packaged",
  Processed = "processed",
  Finished = "finished"
}

@Object()
export class CocoaBag {

    @Property()
    public gtin: string;
  
    @Property()
    public weight: string;
  
    @Property("state", typeof CocoaBagStateEnum)
    state: CocoaBagStateEnum
}


