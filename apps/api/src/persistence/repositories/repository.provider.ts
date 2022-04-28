import { Injectable } from '@nestjs/common';
import edgeConnectionFactory from '../../domain/factories/edgeConnectionFactory';
import getInstanceFactoryForEntity from '../../domain/factories/getInstanceFactoryForEntity';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import { Resource } from '../../domain/models/resource.entity';
import { IEdgeConnectionRepositoryProvider } from '../../domain/repositories/interfaces/IEdgeConnectionRepositoryProvider';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider';
import { ResourceType } from '../../domain/types/resourceTypes';
import { DatabaseProvider } from '../database/database.provider';
import { getArangoCollectionIDFromResourceType } from '../database/getArangoCollectionIDFromResourceType';
import mapArangoEdgeDocumentToEdgeConnectionDTO from '../database/utilities/mapArangoEdgeDocumentToEdgeConnectionDTO';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import { RepositoryForEntity } from './repository-for-entity';

@Injectable()
export class RepositoryProvider implements IRepositoryProvider, IEdgeConnectionRepositoryProvider {
    constructor(protected databaseProvider: DatabaseProvider) {}

    getEdgeConnectionRepository() {
        return new RepositoryForEntity<EdgeConnection>(
            this.databaseProvider,
            'resource_edge_connections',
            edgeConnectionFactory,
            // @ts-expect-error TODO fix types
            mapArangoEdgeDocumentToEdgeConnectionDTO,
            mapEdgeConnectionDTOToArangoEdgeDocument
        );
    }

    forResource<TResource extends Resource>(resourceType: ResourceType) {
        return new RepositoryForEntity<TResource>(
            this.databaseProvider,
            getArangoCollectionIDFromResourceType(resourceType),
            getInstanceFactoryForEntity(resourceType)
        );
    }
}
