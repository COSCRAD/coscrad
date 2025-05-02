import { Injectable } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common';
import getInstanceFactoryForResource from '../../domain/factories/get-instance-factory-for-resource';
import buildInstanceFactory from '../../domain/factories/utilities/buildInstanceFactory';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import { Resource } from '../../domain/models/resource.entity';
import { Tag } from '../../domain/models/tag/tag.entity';
import { CoscradContributor } from '../../domain/models/user-management/contributor/entities/coscrad-contributor.entity';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { ICategoryRepository } from '../../domain/repositories/interfaces/category-repository.interface';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider.interface';
import { IUserRepository } from '../../domain/repositories/interfaces/user-repository.interface';
import { AggregateType } from '../../domain/types/AggregateType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DynamicDataTypeFinderService } from '../../validation';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { getArangoCollectionIDFromResourceType } from '../database/collection-references/getArangoCollectionIDFromResourceType';
import { ArangoDatabaseProvider } from '../database/database.provider';
import mapArangoEdgeDocumentToEdgeConnectionDTO from '../database/utilities/mapArangoEdgeDocumentToEdgeConnectionDTO';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDocument';
import ArangoCategoryRepository from './ArangoCategoryRepository';
import {
    ArangoCommandRepositoryForAggregateRoot,
    IEventRepository,
} from './arango-command-repository-for-aggregate-root';
import { ArangoCoscradUserRepository } from './arango-coscrad-user-repository';
import { ArangoEventRepository } from './arango-event-repository';
import { ArangoRepositoryForAggregate } from './arango-repository-for-aggregate';

@Injectable()
export class ArangoRepositoryProvider implements IRepositoryProvider {
    private readonly eventRepository: ArangoEventRepository;

    constructor(
        protected databaseProvider: ArangoDatabaseProvider,
        // TODO should this be private
        coscradEventFactory: CoscradEventFactory,
        private readonly dynamicDataTypeFinderService: DynamicDataTypeFinderService
    ) {
        this.eventRepository = new ArangoEventRepository(databaseProvider, coscradEventFactory);
    }

    // This is helpful when diagnosing issues with test dependency injection
    getDatabaseName() {
        return this.databaseProvider.getDBInstance().getDatabaseName();
    }

    getEdgeConnectionRepository() {
        return new ArangoRepositoryForAggregate<EdgeConnection>(
            this.databaseProvider,
            ArangoCollectionId.edgeConnectionCollectionID,
            buildInstanceFactory(EdgeConnection),
            mapArangoEdgeDocumentToEdgeConnectionDTO,
            mapEdgeConnectionDTOToArangoEdgeDocument
        );
    }

    getTagRepository() {
        return new ArangoRepositoryForAggregate<Tag>(
            this.databaseProvider,
            ArangoCollectionId.tags,
            buildInstanceFactory(Tag),
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );
    }

    getCategoryRepository(): ICategoryRepository {
        return new ArangoCategoryRepository(this.databaseProvider);
    }

    getUserRepository(): IUserRepository {
        return new ArangoCoscradUserRepository(this.databaseProvider);
    }

    getUserGroupRepository(): IRepositoryForAggregate<CoscradUserGroup> {
        return new ArangoRepositoryForAggregate<CoscradUserGroup>(
            this.databaseProvider,
            ArangoCollectionId.groups,
            buildInstanceFactory(CoscradUserGroup),
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );
    }

    getContributorRepository(): IRepositoryForAggregate<CoscradContributor> {
        return new ArangoRepositoryForAggregate(
            this.databaseProvider,
            ArangoCollectionId.contributors,
            buildInstanceFactory(CoscradContributor),
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );
    }

    getEventRepository(): IEventRepository {
        return new ArangoEventRepository(
            this.databaseProvider,
            new CoscradEventFactory(this.dynamicDataTypeFinderService)
        );
    }

    forResource<TResource extends Resource>(resourceType: ResourceType) {
        const snapshotRepository = new ArangoRepositoryForAggregate<TResource>(
            this.databaseProvider,
            getArangoCollectionIDFromResourceType(resourceType),
            getInstanceFactoryForResource(resourceType),
            // TODO: rename following functions to be arango specific
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );

        // TODO "strangle out the old snapshot approach and remove this check"
        const eventSourcedAggregateTypes = [
            AggregateType.song,
            AggregateType.digitalText,
            AggregateType.term,
            AggregateType.vocabularyList,
            AggregateType.playlist,
            AggregateType.audioItem,
            AggregateType.video,
        ];

        if (eventSourcedAggregateTypes.includes(resourceType)) {
            /**
             * Let's review the relationship of event and snapshot
             * persistence.
             */
            return new ArangoCommandRepositoryForAggregateRoot(
                this.eventRepository,
                snapshotRepository as unknown as IRepositoryForAggregate<TResource>,
                resourceType,
                this.dynamicDataTypeFinderService
            ) as unknown as ArangoRepositoryForAggregate<TResource>;
        }

        return snapshotRepository;
    }
}
