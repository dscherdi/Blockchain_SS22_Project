import {Entity, model, property} from '@loopback/repository';
import { CocoaBagStateEnum } from './cocoastate.model';

@model()
export class CocoaBag extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  gtin: string;

  @property({
    type: 'string',
    required: true,
  })
  weight: string;

  @property({
    type: 'string',
  })
  state: CocoaBagStateEnum

  constructor(data?: Partial<CocoaBag>) {
    super(data);
  }
}

export interface CocoaBagRelations {
  // describe navigational properties here
}

export type CocoaBagWithRelations = CocoaBag & CocoaBagRelations;
