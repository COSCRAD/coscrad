import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { ITermQueryRepository } from '../queries';

export class ArangoTermQueryRepository implements ITermQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel & { actions: ICommandFormAndLabels[] }>
    >;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'term__VIEWS'
        );
    }

    async create(view: ITermViewModel & { actions: ICommandFormAndLabels[] }): Promise<void> {
        return this.database.create(mapEntityDTOToDatabaseDocument(view));
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

        console.log({
            query,
            bindVars,
            you: 'SUCK!',
        });

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        const result = await cursor.all();

        console.log({ result });
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
