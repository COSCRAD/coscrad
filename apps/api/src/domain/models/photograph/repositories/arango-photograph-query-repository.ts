import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToEntityDto from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDtoToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import { IPhotographQueryRepository } from '../queries';
import { PhotographViewModel } from '../queries/photograph.view-model';

export class ArangoPhotographQueryRepository implements IPhotographQueryRepository {
    private readonly database: ArangoDatabaseForCollection<PhotographViewModel>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'photograph__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder('photograph__VIEWS');
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

    async tag(photographId: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(photographId, tagId));
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
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

    async attribute(photographId: AggregateId, summary: ContributionSummary): Promise<void> {
        await this.database
            .query(this.baseResourceQueryBuilder.attribute(photographId, summary))
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
