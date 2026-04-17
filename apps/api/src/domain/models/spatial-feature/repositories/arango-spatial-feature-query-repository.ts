import { PaginatedResponse } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
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
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { ISpatialFeatureQueryRepository } from '../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../queries/spatial-feature.view-model.event-sourced';

export class ArangoSpatialFeatureQueryRepository implements ISpatialFeatureQueryRepository {
    private readonly database: ArangoDatabaseForCollection<EventSourcedSpatialFeatureViewModel>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        @Inject(COSCRAD_LOGGER_TOKEN)
        private readonly logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'spatialFeature__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(
            'spatialFeature__VIEWS'
        );
    }

    async create(view: EventSourcedSpatialFeatureViewModel): Promise<void> {
        const document = mapEntityDTOToDatabaseDocument(view);

        await this.database.create(document).catch((error) => {
            throw new InternalError(error);
        });
    }

    async createMany(views: EventSourcedSpatialFeatureViewModel[]): Promise<void> {
        const documents = views.map(mapEntityDTOToDatabaseDocument);

        await this.database.createMany(documents);
    }

    async fetchById(
        id: string,
        user?: CoscradUserWithGroups
    ): Promise<Maybe<EventSourcedSpatialFeatureViewModel>> {
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

        return EventSourcedSpatialFeatureViewModel.fromDto(asView);
    }

    async fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<EventSourcedSpatialFeatureViewModel>> {
        const result = await this.database.fetchForUser(options);

        if (isInternalError(result)) {
            throw new InternalError(
                `
                Encountered an unexpected database error when fetching all spatial features
                `,
                [result]
            );
        }

        const { selected, count } = result;

        const buildResult = selected.map((doc) => {
            const dto = mapDatabaseDocumentToAggregateDTO(doc);

            return EventSourcedSpatialFeatureViewModel.fromDto(dto);
        });

        return {
            entities: buildResult,
            page: options?.pagination?.page || 1,
            count,
        };
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
                `Failed to add attribution for spatial feature via VideoRepository: ${reason}`
            );
        });
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.allowUser(aggregateId, userId);

        const cursor = await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to allow user access to spatial feature via SpatialFeatureRepository: ${reason}`
            );
        });

        await cursor.all();
    }

    async publish(id: AggregateId): Promise<void> {
        const query = this.baseResourceQueryBuilder.publish(id);

        const cursor = await await this.database.query(query).catch((reason) => {
            throw new InternalError(
                `Failed to publish spatial feature via spatialFeatureRepository: ${reason}`
            );
        });

        await cursor.all();
    }
}
