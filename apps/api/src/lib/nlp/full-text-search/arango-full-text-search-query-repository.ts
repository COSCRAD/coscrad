import { LanguageCode, PaginatedResponse } from '@coscrad/api-interfaces';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../persistence/database/arango-database-for-collection';
import { ResultOrError } from '../../../types/ResultOrError';
import { Token } from '../tokenization';
import { ArangoFullTextSearchDocument } from './arango-full-text-search-document';
import { FullTextSearchRecord } from './full-text-result-record.dto';
import { IFullTextSearchQueryRepository } from './full-text-search-query.interface';

export class ArangoFullTextSearchQueryRepository implements IFullTextSearchQueryRepository {
    private readonly database: ArangoDatabaseForCollection<ArangoFullTextSearchDocument>;

    private readonly collectionName: 'full-text-search__VIEWS';

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection<ArangoFullTextSearchDocument>(
            new ArangoDatabase(connectionProvider.getConnection()),
            this.collectionName
        );
    }

    index(
        _tokens: Token[],
        _entityCompositeIdentifier: { type: string; id: string }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findByLetter(
        _letter: string,
        _languageCode: LanguageCode
    ): Promise<ResultOrError<PaginatedResponse<FullTextSearchRecord>>> {
        throw new Error('Method not implemented.');
    }

    findByText(
        _searchText: string
    ): Promise<ResultOrError<PaginatedResponse<FullTextSearchRecord>>> {
        throw new Error('Method not implemented.');
    }
}
