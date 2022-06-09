import {Entity, model, property} from '@loopback/repository';

@model()
export class Enpalasset extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  value: string;


  constructor(data?: Partial<Enpalasset>) {
    super(data);
  }
}

export interface EnpalassetRelations {
  // describe navigational properties here
}

export type EnpalassetWithRelations = Enpalasset & EnpalassetRelations;
