import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { CocoaBag, CocoaBagStateEnum } from '../models';
import { CocoaRepository } from '../repositories';
import { BlockchainClient } from '../services/blockchain-service';
import { IdentityService } from '../services/identity-service';

export class CocoaController {
  constructor(@service(BlockchainClient) private blockchainClient: BlockchainClient,
  @service(IdentityService) private identityService: IdentityService,
    @repository(CocoaRepository)
    public cocoaRepository: CocoaRepository,
  ) { }

  @post('/api/v1/CocoaBag/', {
    responses: {
      '200': {
        description: 'create a new Cocoa Bag',
        content: { 'application/json': { schema: { 'x-ts-type': String } } },
      },
    },
  })
  async createCocoaBag(@requestBody() bag: CocoaBag): Promise<string> {
    try {
      const id = this.identityService.createCocoaBagIdentity();
      var cocoabag = new CocoaBag({gtin: id, weight: bag.weight, state: CocoaBagStateEnum.Produced});

      const result = await this.blockchainClient.createCocoaBag(id, JSON.stringify(cocoabag));
      return id;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  @get('/api/v1/CocoaBag/{key}', {
    responses: {
      '200': {
        description: 'read the Cocoa Bag',
        content: { 'application/json': { schema: { 'x-ts-type': String } } },
      },
    },
  })
  async readEquaine(@param({ name: 'key', in: 'path' }) key: string): Promise<CocoaBag> {
    try {
      const result = await this.blockchainClient.readCocoaBag(key);
      return result;
    } catch (error) {
      return error;
    }
  }
}
