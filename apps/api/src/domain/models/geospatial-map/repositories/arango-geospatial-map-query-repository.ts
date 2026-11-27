import { IMultilingualTextItem, PaginatedResponse } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../coscrad-cli/logging';
import {
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradSimpleCondition,
} from '../../../../lib/coscrad-query-language';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { DTO } from '../../../../types/DTO';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { GeospatialMapViewModel } from '../queries/geospatial-map.view-model';
import { IGeospatialMapQueryRepository } from './geospatial-map-query-repository.interface';

export class ArangoGeospatialMapQueryRepository implements IGeospatialMapQueryRepository {
    private readonly database: ArangoDatabaseForCollection<DTO<GeospatialMapViewModel>>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        @Inject(COSCRAD_LOGGER_TOKEN)
        private readonly logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'map__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder('map__VIEWS');
    }

    async create(view: GeospatialMapViewModel): Promise<void> {
        const viewDto = cloneToPlainObject(view) as DTO<GeospatialMapViewModel>;

        const document = mapEntityDTOToDatabaseDocument({
            ...viewDto,
            name: view.name,
        });

        await this.database.create(document).catch((error) => {
            throw new InternalError(error);
        });
    }

    async createMany(views: GeospatialMapViewModel[]): Promise<void> {
        const documents = views.map((view) =>
            // The generic `DTO` type is not playing nice with records here.
            mapEntityDTOToDatabaseDocument(view as unknown as DTO<GeospatialMapViewModel>)
        );

        await this.database.createMany(documents);
    }

    async fetchById(
        id: string,
        user?: CoscradUserWithGroups
    ): Promise<Maybe<GeospatialMapViewModel>> {
        const idEquals: CoscradSimpleCondition = {
            type: CoscradConditionBlockType.SIMPLE,
            operator: CoscradBooleanOperator.TEXT_EQUALS,
            params: [id],
            field: 'id',
        };

        const result = await this.database.fetchForUser({
            filter: idEquals,
            user,
        });

        if (isInternalError(result)) {
            throw result;
        }

        const { selected } = result;

        if (selected.length === 0) {
            return NotFound;
        }

        const asView = mapDatabaseDocumentToAggregateDTO(selected[0]);

        return GeospatialMapViewModel.fromDto(asView);
    }

    async fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<GeospatialMapViewModel>> {
        const result = await this.database.fetchForUser(options);

        if (isInternalError(result)) {
            throw new InternalError(
                `
                Encountered an unexpected database error when fetching all geospatial maps
                `,
                [result]
            );
        }

        const { selected, count } = result;

        const buildResult = selected.map((doc) => {
            const dto = mapDatabaseDocumentToAggregateDTO(doc);

            return GeospatialMapViewModel.fromDto(dto);
        });

        return {
            entities: buildResult,
            page: options?.pagination?.page || 1,
            count,
        };
    }

    async translateName(id: string, translationItem: IMultilingualTextItem): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
                name: {
                    items: APPEND(doc.name.items,@translationItem)
                }
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'map__VIEWS',
            id,
            translationItem,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to translate geospatial feature via GeospatialFeatureRepository: ${reason}`
                );
            });

        await cursor.all();
    }

    async addSpatialFeature(id: string, spatialFeatureId: string): Promise<void> {
        const query = `
        FOR m IN @@collectionName
        FILTER m._key == @id
        FOR s IN spatialFeature__VIEWS
        FILTER s._key == @spatialFeatureId
        LET newEntry = {
            id: @spatialFeatureId

        }

        UPDATE m WITH {
            spatialFeaturesById: MERGE(m.spatialFeaturesById,{
            [@spatialFeatureId]: newEntry
            })
        } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'map__VIEWS',
            id,
            spatialFeatureId,
        };

        const cursor = await await this.database.query({ query, bindVars }).catch((error) => {
            throw new InternalError(
                `failed to add spatial feature: via GeospatialFeatureRepository: ${error}`
            );
        });

        await cursor.all();
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
    }

    async tag(id: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(id, tagId));
    }

    async attribute(id: string, contributionSummary: ContributionSummary): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.attribute(id, contributionSummary);

        await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to add attribution for geospatial map via: VideoRepository: ${reason}`
            );
        });
    }

    async allowUser(aggregateId: string, userId: string): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.allowUser(aggregateId, userId);

        const cursor = await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to allow user access to geospatial map via GeospatialMapRepository: ${reason}`
            );
        });

        await cursor.all();
    }

    async publish(id: string): Promise<void> {
        const query = this.baseResourceQueryBuilder.publish(id);

        const cursor = await this.database.query(query).catch((reason) => {
            throw new InternalError(
                `Failed to publish geospatial map via GeospatialMapRepository: ${reason}`
            );
        });

        await cursor.all();
    }

    // TODO what should we do with this?
    subscribeToUpdates(): Observable<{ data: { type: string } }> {
        throw new Error('Method not implemented.');
    }

    async delete(_id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
