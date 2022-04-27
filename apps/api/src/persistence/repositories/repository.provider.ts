import { Injectable } from '@nestjs/common';
import getInstanceFactoryForEntity from '../../domain/factories/getInstanceFactoryForEntity';
import { Resource } from '../../domain/models/resource.entity';
import { IEdgeConnectionRepository } from '../../domain/repositories/interfaces/IEdgeConnectionRepository';
import { IEdgeConnectionRepositoryProvider } from '../../domain/repositories/interfaces/IEdgeConnectionRepositoryProvider';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider';
import { ResourceType } from '../../domain/types/resourceTypes';
import { DatabaseProvider } from '../database/database.provider';
import { getArangoCollectionIDFromResourceType } from '../database/getArangoCollectionIDFromResourceType';
import EdgeConnectionRepository from './EdgeConnectionRepository';
import { RepositoryForEntity } from './repository-for-entity';

@Injectable()
export class RepositoryProvider implements IRepositoryProvider, IEdgeConnectionRepositoryProvider {
    constructor(protected databaseProvider: DatabaseProvider) {}

    forResource<TResource extends Resource>(resourceType: ResourceType) {
        return new RepositoryForEntity<TResource>(
            this.databaseProvider,
            getArangoCollectionIDFromResourceType(resourceType),
            getInstanceFactoryForEntity(resourceType)
        );
    }

    getEdgeConnectionRepository() {
        return new EdgeConnectionRepository() as IEdgeConnectionRepository;
    }
}
