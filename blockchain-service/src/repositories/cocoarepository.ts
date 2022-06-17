import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {CocoaBag, CocoaBagRelations} from '../models';

export class CocoaRepository extends DefaultCrudRepository<
  CocoaBag,
  typeof CocoaBag.prototype.gtin,
  CocoaBagRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(CocoaBag, dataSource);
  }
}
