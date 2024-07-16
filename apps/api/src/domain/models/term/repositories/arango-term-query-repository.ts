import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
    ITermViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ITermQueryRepository } from '../queries';

export class ArangoTermQueryRepository implements ITermQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel & { actions: ICommandFormAndLabels[] }>
    >;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        // AUDIO_ITEM_QUERY_REPOSITORY?
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN)
        private readonly audioItemQueryRepository: IAudioItemQueryRepository
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'term__VIEWS'
        );
    }

    async create(view: ITermViewModel & { actions: ICommandFormAndLabels[] }): Promise<void> {
        return this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async createMany(
        views: (ITermViewModel & { actions: ICommandFormAndLabels[] })[]
    ): Promise<void> {
        return this.database.createMany(views.map(mapEntityDTOToDatabaseDocument));
    }

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
            }
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

    async addAudio(termId: AggregateId, _languageCode: LanguageCode, audioItemId: string) {
        /**
         * TODO Include this in a single query below to ensure this operation
         * is transactional.
         */
        const audioItemSearchResult = await this.audioItemQueryRepository.fetchById(audioItemId);

        if (isNotFound(audioItemSearchResult)) {
            // TODO log error but still fail gracefully
            return;
        }

        const { mediaItemId, mimeType } = audioItemSearchResult;

        if (isNullOrUndefined(mediaItemId) || isNullOrUndefined(mimeType)) {
            // TODO log error but fail gracefully
            return;
        }

        // note the casing here on `audioURL`
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            mediaItemId: @mediaItemId,
            mimeType: @mimeType
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: termId,
            mediaItemId,
            mimeType,
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

    async fetchById(
        id: AggregateId
    ): Promise<Maybe<ITermViewModel & { actions: ICommandFormAndLabels[] }>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        const asView = mapDatabaseDocumentToAggregateDTO(result);

        return asView;
    }

    async fetchMany(): Promise<(ITermViewModel & { actions: ICommandFormAndLabels[] })[]> {
        const result = await this.database.fetchMany();

        return result.map(mapDatabaseDocumentToAggregateDTO);
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }
}
