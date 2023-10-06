import { Injectable } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common';
import getInstanceFactoryForResource from '../../domain/factories/getInstanceFactoryForResource';
import buildInstanceFactory from '../../domain/factories/utilities/buildInstanceFactory';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import { Resource } from '../../domain/models/resource.entity';
import { Song } from '../../domain/models/song/song.entity';
import { Tag } from '../../domain/models/tag/tag.entity';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { ICategoryRepository } from '../../domain/repositories/interfaces/category-repository.interface';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider.interface';
import { IUserRepository } from '../../domain/repositories/interfaces/user-repository.interface';
import { ResourceType } from '../../domain/types/ResourceType';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { getArangoCollectionIDFromResourceType } from '../database/collection-references/getArangoCollectionIDFromResourceType';
import { ArangoDatabaseProvider } from '../database/database.provider';
import mapArangoEdgeDocumentToEdgeConnectionDTO from '../database/utilities/mapArangoEdgeDocumentToEdgeConnectionDTO';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDTO';
import ArangoCategoryRepository from './ArangoCategoryRepository';
import { ArangoCoscradUserRepository } from './arango-coscrad-user-repository';
import { ArangoEventRepository } from './arango-event-repository';
import { ArangoRepositoryForAggregate } from './arango-repository-for-aggregate';
import { ArangoSongCommandRepository } from './arango-song-command-repository';

@Injectable()
export class ArangoRepositoryProvider implements IRepositoryProvider {
    private readonly eventRepository: ArangoEventRepository;

    constructor(
        protected databaseProvider: ArangoDatabaseProvider,
        coscradEventFactory: CoscradEventFactory
    ) {
        this.eventRepository = new ArangoEventRepository(databaseProvider, coscradEventFactory);
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

    forResource<TResource extends Resource>(resourceType: ResourceType) {
        const snapshotRepository = new ArangoRepositoryForAggregate<TResource>(
            this.databaseProvider,
            getArangoCollectionIDFromResourceType(resourceType),
            getInstanceFactoryForResource(resourceType),
            mapDatabaseDTOToEntityDTO,
            mapEntityDTOToDatabaseDTO
        );

        if (resourceType === ResourceType.song) {
            return new ArangoSongCommandRepository(
                this.eventRepository,
                snapshotRepository as unknown as IRepositoryForAggregate<Song>
            ) as unknown as ArangoRepositoryForAggregate<TResource>;
        }

        return snapshotRepository;
    }
}
