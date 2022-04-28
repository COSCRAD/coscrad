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
import { arangoEdgeCollectionID } from '../database/types/ArangoCollectionId';
import mapArangoEdgeDocumentToEdgeConnectionDTO from '../database/utilities/mapArangoEdgeDocumentToEdgeConnectionDTO';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDTOToEntityDTO';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDTO';
import { RepositoryForEntity } from './repository-for-entity';

@Injectable()
export class RepositoryProvider implements IRepositoryProvider, IEdgeConnectionRepositoryProvider {
    constructor(protected databaseProvider: DatabaseProvider) {}

    getEdgeConnectionRepository() {
        return new RepositoryForEntity<EdgeConnection>(
            this.databaseProvider,
            arangoEdgeCollectionID,
            edgeConnectionFactory,
            mapArangoEdgeDocumentToEdgeConnectionDTO,
            mapEdgeConnectionDTOToArangoEdgeDocument
        );
    }

    forResource<TResource extends Resource>(resourceType: ResourceType) {
        return new RepositoryForEntity<TResource>(
            this.databaseProvider,
            getArangoCollectionIDFromResourceType(resourceType),
            getInstanceFactoryForEntity(resourceType),
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );
    }
}
