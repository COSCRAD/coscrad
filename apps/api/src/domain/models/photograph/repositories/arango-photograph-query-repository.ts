import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoViewRepository } from '../../../../persistence/database/decorators/arango-view-repository.decorator';
import mapDatabaseDocumentToEntityDto from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDtoToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { ArangoResourceQueryBuilder } from '../../term/repositories/arango-resource-query-builder';
import { IPhotographQueryRepository } from '../queries';
import { PhotographViewModel } from '../queries/photograph.view-model';

@ArangoViewRepository('photograph')
export class ArangoPhotographQueryRepository implements IPhotographQueryRepository {
    private readonly database: ArangoDatabaseForCollection<PhotographViewModel>;

    /**
     * We use this helper to achieve composition over inheritance.
     */
    private readonly baseResourceQueryBuilder: ArangoResourceQueryBuilder;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'photograph__VIEWS'
        );

        this.baseResourceQueryBuilder = new ArangoResourceQueryBuilder('photograph__VIEWS');
    }

    async fetchById(id: AggregateId): Promise<Maybe<PhotographViewModel>> {
        const documentSearchResult = await this.database.fetchById(id);

        if (isNotFound(documentSearchResult)) {
            return documentSearchResult;
        }

        const viewModelDto = mapDatabaseDocumentToEntityDto(
            documentSearchResult
        ) as PhotographViewModel & {
            actions: ICommandFormAndLabels[];
        };

        return PhotographViewModel.fromDto(viewModelDto);
    }

    async fetchMany(): Promise<PhotographViewModel[]> {
        const documents = await this.database.fetchMany();

        const viewModelsFromRepo = documents.map((doc) =>
            PhotographViewModel.fromDto(mapDatabaseDocumentToEntityDto(doc))
        ) as PhotographViewModel[];

        return viewModelsFromRepo;
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async create(view: PhotographViewModel): Promise<void> {
        const viewToCreate = mapEntityDtoToDatabaseDocument(view);

        // TODO If we're going to throw here, we need to wrap the top level event handlers in a try...catch
        return this.database.create(viewToCreate).catch((error) => {
            throw new InternalError(
                `failed to create photograph view in ArangoPhotographQueryRepository`,
                [error]
            );
        });
    }

    async createMany(views: PhotographViewModel[]): Promise<void> {
        return this.database
            .createMany(views.map(mapEntityDtoToDatabaseDocument))
            .catch((error) => {
                throw new InternalError(
                    `failed to create many photograph views in ArangoPhotographQueryRepository`,
                    [error]
                );
            });
    }

    async publish(id: AggregateId): Promise<void> {
        const cursor = await this.database
            .query(this.baseResourceQueryBuilder.publish(id))
            .catch((reason) => {
                throw new InternalError(
                    `Failed to publish photograph via PhotographRepository: ${reason}`
                );
            });

        await cursor.all();
    }

    async allowUser(photographId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database
            .query(this.baseResourceQueryBuilder.allowUser(photographId, userId))
            .catch((reason) => {
                throw new InternalError(
                    `Failed to grant user access via PhotographRepository: ${reason}`
                );
            });
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async attribute(photographId: AggregateId, contributorIds: AggregateId[]): Promise<void> {
        await this.database
            .query(this.baseResourceQueryBuilder.attribute(photographId, contributorIds))
            .catch((reason) => {
                throw new InternalError(
                    `Failed to add attribution for photograph via PhotographRepository: ${reason}`
                );
            });
    }

    subscribeToUpdates(): Observable<{ data: { type: string } }> {
        return this.database.getViewUpdateNotifications();
    }
}
