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
import { Enpalasset } from '../models';
import { EnpalassetRepository } from '../repositories';
import { BlockchainClient } from '../services/blockchain-service';

export class AssetController {
  constructor(@service(BlockchainClient) private blockchainClient: BlockchainClient,
    @repository(EnpalassetRepository)
    public enpalassetRepository: EnpalassetRepository,
  ) { }

  @post('/api/v1/createAsset/', {
    responses: {
      '200': {
        description: 'create a new EnpalAsset',
        content: { 'application/json': { schema: { 'x-ts-type': String } } },
      },
    },
  })
  async createasset(@requestBody() req: Enpalasset): Promise<Boolean> {
    try {
      const result = await this.blockchainClient.createAsset(req.id, req.value);
      return result;
    } catch (error) {
      return error;
    }
  }

  @get('/api/v1/createAsset/{key}', {
    responses: {
      '200': {
        description: 'read the EnpalAsset',
        content: { 'application/json': { schema: { 'x-ts-type': String } } },
      },
    },
  })
  async readEquaine(@param({ name: 'key', in: 'path' }) key: string): Promise<Enpalasset> {
    try {
      const result = await this.blockchainClient.readEnpalAsset(key);
      return result;
    } catch (error) {
      return error;
    }
  }
}
