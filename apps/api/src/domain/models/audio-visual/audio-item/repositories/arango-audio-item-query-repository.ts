import {
    IAudioItemViewModel,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
} from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { IAudioItemQueryRepository } from '../queries/audio-item-query-repository.interface';

export class ArangoAudioItemQueryRepository implements IAudioItemQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<IAudioItemViewModel & { actions: ICommandFormAndLabels[] }>
    >;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'audioItem__VIEWS'
        );
    }

    async create(
        view: IDetailQueryResult<IAudioItemViewModel> & { _actions: ICommandFormAndLabels[] }
    ): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async createMany(
        views: (IAudioItemViewModel & { actions: ICommandFormAndLabels[] } & {
            actions: ICommandFormAndLabels[];
        })[]
    ): Promise<void> {
        await this.database.createMany(views.map(mapEntityDTOToDatabaseDocument));
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async publish(id: AggregateId): Promise<void> {
        await this.database.update(id, {
            isPublished: true,
        });
    }

    async fetchById(
        id: AggregateId
    ): Promise<Maybe<IAudioItemViewModel & { actions: ICommandFormAndLabels[] }>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        // should we rename this helper method?
        return mapDatabaseDocumentToAggregateDTO(result) as IAudioItemViewModel & {
            actions: ICommandFormAndLabels[];
        };
    }

    async fetchMany(): Promise<(IAudioItemViewModel & { actions: ICommandFormAndLabels[] })[]> {
        const documents = await this.database.fetchMany();

        return documents.map(mapDatabaseDocumentToAggregateDTO) as (IAudioItemViewModel & {
            actions: ICommandFormAndLabels[];
        })[];
    }

    async translateName(
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
            // TODO save this as an instance variable or global constant
            '@collectionName': 'audioItem__VIEWS',
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

    async count(): Promise<number> {
        return this.database.getCount();
    }
}
