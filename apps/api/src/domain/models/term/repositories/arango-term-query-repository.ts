import {
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../coscrad-cli/logging';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { AggregateId } from '../../../types/AggregateId';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ITermQueryRepository } from '../queries';
import { ArangoResourceQueryBuilder } from './arango-resource-query-builder';

export class ArangoTermQueryRepository implements ITermQueryRepository {
    private readonly database: ArangoDatabaseForCollection<TermViewModel>;

    /**
     * We use this helper to achieve composition over inheritance.
     */
    private readonly baseResourceQueryBuilder: ArangoResourceQueryBuilder;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        // AUDIO_ITEM_QUERY_REPOSITORY?
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN)
        private readonly audioItemQueryRepository: IAudioItemQueryRepository,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'term__VIEWS'
        );

        this.baseResourceQueryBuilder = new ArangoResourceQueryBuilder(`term__VIEWS`);
    }

    async create(view: TermViewModel): Promise<void> {
        const document = mapEntityDTOToDatabaseDocument(view);

        await this.database.create(document).catch((error) => {
            throw new InternalError(error);
        });
    }

    async createMany(views: TermViewModel[]): Promise<void> {
        const documents = views.map(mapEntityDTOToDatabaseDocument);

        return this.database.createMany(documents);
    }

    async publish(id: AggregateId): Promise<void> {
        const query = this.baseResourceQueryBuilder.publish(id);

        const cursor = await this.database.query(query).catch((reason) => {
            throw new InternalError(`Failed to publish term via TermRepository: ${reason}`);
        });

        await cursor.all();
    }

    /**
     * TODO[https://www.pivotaltracker.com/story/show/188764063] support `unpublish`
     */

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async translate(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newItem = {
                    text: @text,
                    languageCode: @languageCode,
                    role: @role
        }
        UPDATE doc WITH {
            name: {
                items: APPEND(doc.name.items,newItem)
            },
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: id,
            text: text,
            role: role,
            languageCode: languageCode,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        await cursor.all();
    }

    async elicitFromPrompt(
        id: AggregateId,
        { text, languageCode }: Omit<IMultilingualTextItem, 'role'>
    ): Promise<void> {
        /**
         * Note that the only difference between this and `translate` is currently
         * that `elicitFromPrompt` removes "ELICIT_TERM_FROM_PROMPT" from actions.
         * However, we may also want to expose `isPromptTerm` in the future, in which
         * case this property will differ as well.
         */
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newItem = {
                    text: @text,
                    languageCode: @languageCode,
                    role: @role
        }
        UPDATE doc WITH {
            actions: REMOVE_VALUE(doc.actions,"ELICIT_TERM_FROM_PROMPT"),
            name: {
                items: APPEND(doc.name.items,newItem)
            },
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: id,
            text: text,
            role: MultilingualTextItemRole.elicitedFromPrompt,
            languageCode: languageCode,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to elicit term from prompt via TermRepository: ${reason}`
                );
            });

        await cursor.all();
    }

    async addAudio(termId: AggregateId, _languageCode: LanguageCode, audioItemId: string) {
        /**
         * TODO Include this in a single query below to ensure this operation
         * is transactional.
         */
        const audioItemSearchResult = await this.audioItemQueryRepository.fetchById(audioItemId);

        if (isNotFound(audioItemSearchResult)) {
            this.logger.log(
                `Failed to add audio for term: ${termId}. Audio item: ${audioItemId} not found.`
            );
            return;
        }

        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            actions: REMOVE_VALUE(doc.actions,"ADD_AUDIO_FOR_TERM")
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: termId,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to add audio for term via term query repository: ${reason}`
                );
            });

        await cursor.all();
    }

    // note that it is important to pass APPEND an array of items to append when appending a string value to an existing array
    async allowUser(termId: AggregateId, userId: AggregateId): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.allowUser(termId, userId);

        const cursor = await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to allow user access to term via TermRepository: ${reason}`
            );
        });

        await cursor.all();
    }

    // TODO share this with other resources
    async attribute(termId: AggregateId, contributorIds: AggregateId[]): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.attribute(termId, contributorIds);

        await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to add attribution for term via TermRepository: ${reason}`
            );
        });
    }

    async fetchById(id: AggregateId): Promise<Maybe<TermViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        const asView = mapDatabaseDocumentToAggregateDTO(result);

        return TermViewModel.fromDto(asView);
    }

    async fetchMany(): Promise<TermViewModel[]> {
        const result = await this.database.fetchMany();

        return result.map((doc) => TermViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc)));
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    subscribeToUpdates(): Observable<{ data: { type: string } }> {
        return this.database.getViewUpdateNotifications();
    }
}
