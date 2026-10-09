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

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async translateName(_id: string, _translationItem: IMultilingualTextItem): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async addSpatialFeature(_id: string, _spatialFeatureId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async createNoteAbout(_id: string, _dto: INoteCreationDto): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async createConnection(_id: string, _dto: IResourceConnectionDto): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async tag(id: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(id, tagId));
    }

    async attribute(_id: string, _contributionSummary: ContributionSummary): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async allowUser(_aggregateId: string, _userId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async publish(_id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    subscribleToUpdates(): Observable<{ data: { type: string } }> {
        throw new Error('Method not implemented.');
    }

    async delete(_id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
