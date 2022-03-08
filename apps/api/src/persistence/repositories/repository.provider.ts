import { Injectable } from '@nestjs/common';
import getInstanceFactoryForEntity from '../../domain/factories/getInstanceFactoryForEntity';
import { Entity } from '../../domain/models/entity';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider';
import { EntityType } from '../../domain/types/entityType';
import { DatabaseProvider } from '../database/database.provider';
import { getArangoCollectionIDFromEntityType } from '../database/get-arango-collection-ids';
import { RepositoryForEntity } from './repository-for-entity';

@Injectable()
export class RepositoryProvider implements IRepositoryProvider {
  constructor(protected databaseProvider: DatabaseProvider) {}

  forEntity<TEntity extends Entity>(entityType: EntityType) {
    return new RepositoryForEntity<TEntity>(
      this.databaseProvider,
      getArangoCollectionIDFromEntityType(entityType),
      getInstanceFactoryForEntity(entityType)
    );
  }
}
