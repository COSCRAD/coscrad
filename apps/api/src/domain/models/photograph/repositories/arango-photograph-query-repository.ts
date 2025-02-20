import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../coscrad-cli/logging';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToEntityDto from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDtoToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PhotographViewModel } from '../../../../queries/buildViewModelForResource/viewModels/photograph.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { IPhotographQueryRepository } from '../queries';

export class ArangoPhotographQueryRepository implements IPhotographQueryRepository {
    private readonly database: ArangoDatabaseForCollection<PhotographViewModel>;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) _logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'photograph__VIEWS'
        );
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
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            isPublished: true,
            actions: REMOVE_VALUE(doc.actions, "PUBLISH_RESOURCE")
        } IN @@collectionName
         `;

        const bindVars = {
            '@collectionName': 'photograph__VIEWS',
            id: id,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to publish photograph via PhotographRepository: ${reason}`
                );
            });

        await cursor.all();
    }

    async allowUser(photographId: AggregateId, userId: AggregateId): Promise<void> {
        const query = `
    FOR doc IN @@collectionName
    FILTER doc._key == @id
    UPDATE doc WITH {
        accessControlList: {
            allowedUserIds: APPEND(doc.accessControlList.allowedUserIds,[@userId])
        }
    } IN @@collectionName

    `;

        const bindVars = {
            '@collectionName': 'photograph__VIEWS',
            id: photographId,
            userId,
        };

        await this.database
            .query({
                query,
                bindVars,
            })
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
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        LET newContributions = (
            FOR contributorId IN @contributorIds
                FOR c in contributors
                    FILTER c._key == contributorId
                    return {
                        id: c._key,
                        fullName: CONCAT(CONCAT(c.fullName.firstName,' '),c.fullName.lastName)
                    }
        )
        LET updatedContributions = APPEND(doc.contributions,newContributions)
        UPDATE doc WITH {
            contributions: updatedContributions
        } IN @@collectionName
         RETURN updatedContributions
        `;

        const bindVars = {
            // todo is this necessary?
            '@collectionName': 'photograph__VIEWS',
            id: photographId,
            contributorIds,
        };

        await this.database
            .query({
                query,
                bindVars,
            })
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
