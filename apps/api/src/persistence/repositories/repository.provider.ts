import { Injectable } from '@nestjs/common';
import tagValidator from '../../domain/domainModelValidators/tagValidator';
import edgeConnectionFactory from '../../domain/factories/edgeConnectionFactory';
import getInstanceFactoryForEntity from '../../domain/factories/getInstanceFactoryForEntity';
import buildInstanceFactory from '../../domain/factories/utilities/buildInstanceFactory';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import { Resource } from '../../domain/models/resource.entity';
import { Tag } from '../../domain/models/tag/tag.entity';
import { ICategoryRepository } from '../../domain/repositories/interfaces/ICategoryRepository';
import { ICategoryRepositoryProvider } from '../../domain/repositories/interfaces/ICategoryRepositoryProvider';
import { IEdgeConnectionRepositoryProvider } from '../../domain/repositories/interfaces/IEdgeConnectionRepositoryProvider';
import { ITagRepositoryProvider } from '../../domain/repositories/interfaces/ITagRepositoryProvider';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider';
import { ResourceType } from '../../domain/types/ResourceType';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { getArangoCollectionIDFromResourceType } from '../database/collection-references/getArangoCollectionIDFromResourceType';
import { DatabaseProvider } from '../database/database.provider';
import mapArangoEdgeDocumentToEdgeConnectionDTO from '../database/utilities/mapArangoEdgeDocumentToEdgeConnectionDTO';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDTOToEntityDTO';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDTO';
import ArangoCategoryRepository from './ArangoCategoryRepository';
import { RepositoryForEntity } from './repository-for-entity';

@Injectable()
export class RepositoryProvider
    implements
        IRepositoryProvider,
        IEdgeConnectionRepositoryProvider,
        ITagRepositoryProvider,
        ICategoryRepositoryProvider
{
    constructor(protected databaseProvider: DatabaseProvider) {}

    getEdgeConnectionRepository() {
        return new RepositoryForEntity<EdgeConnection>(
            this.databaseProvider,
            ArangoCollectionId.edgeConnectionCollectionID,
            edgeConnectionFactory,
            mapArangoEdgeDocumentToEdgeConnectionDTO,
            mapEdgeConnectionDTOToArangoEdgeDocument
        );
    }

    getTagRepository() {
        return new RepositoryForEntity<Tag>(
            this.databaseProvider,
            ArangoCollectionId.tags,
            buildInstanceFactory(tagValidator, Tag),
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );
    }

    getCategoryRepository(): ICategoryRepository {
        return new ArangoCategoryRepository(this.databaseProvider);
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
