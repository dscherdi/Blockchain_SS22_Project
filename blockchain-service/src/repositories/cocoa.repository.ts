import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Enpalasset, EnpalassetRelations} from '../models';

export class CocoaRepository extends DefaultCrudRepository<
  CocoaBag,
  typeof Enpalasset.prototype.id,
  EnpalassetRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Enpalasset, dataSource);
  }
}
