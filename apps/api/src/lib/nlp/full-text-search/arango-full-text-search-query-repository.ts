import { LanguageCode, PaginatedResponse } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { forwardRef, Inject } from '@nestjs/common';
import { PaginationOptions } from '../../../app/controllers/resources/term.controller';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../persistence/database/arango-database-for-collection';
import { ResultOrError } from '../../../types/ResultOrError';
import { InternalError } from '../../errors/InternalError';
import { Token } from '../tokenization';
import { ArangoFullTextSearchDocument } from './arango-full-text-search-document';
import { FullTextSearchRecord } from './full-text-result-record.dto';
import { IFullTextSearchQueryRepository } from './full-text-search-query.interface';

export class ArangoFullTextSearchQueryRepository implements IFullTextSearchQueryRepository {
    private readonly database: ArangoDatabaseForCollection<ArangoFullTextSearchDocument>;

    private readonly collectionName = 'full_text_search__VIEWS';

    constructor(
        @Inject(forwardRef(() => ArangoConnectionProvider))
        connectionProvider: ArangoConnectionProvider
    ) {
        this.database = new ArangoDatabaseForCollection<ArangoFullTextSearchDocument>(
            new ArangoDatabase(connectionProvider.getConnection()),
            this.collectionName
        );
    }

    async index(
        tokens: Token[],
        entityCompositeIdentifier: { type: string; id: string }
        // TODO returned errors?
    ): Promise<void> {
        const aql = `
            let newEntities = {
                [@type]: [@id]
            }
            for t in @tokens
            upsert filter t.token.text == t.text
            insert {
                token: t,
                entities: newEntities
            }
            update {
                entities: merge(OLD.entities,newEntities)
            }
            in @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            type: entityCompositeIdentifier.type,
            id: entityCompositeIdentifier.id,
            tokens,
        };

        const cursor = await this.database.query({ query: aql, bindVars });

        await cursor.all();
    }

    async findByLetter(
        letter: string,
        languageCode?: LanguageCode,
        options: {
            user?: CoscradUserWithGroups;
            pagination?: PaginationOptions;
        } = {}
    ): Promise<ResultOrError<PaginatedResponse<FullTextSearchRecord>>> {
        if (!isNonEmptyString(languageCode)) {
            return new InternalError(
                `Currently, you must specify the language when performing a full-text search.`
            );
        }

        if (languageCode !== LanguageCode.Chilcotin) {
            return new InternalError(`Unsupported language for full-text search: ${languageCode}`);
        }

        // TODO reuse logic from `fetchForUser`
        const { size, page } = options?.pagination || {
            size: 100,
            page: 1,
        };

        const aql = `
        for doc in @@collectionName
        filter contains(doc.token.characters[*].text,@letter) && doc.token.languageCode == @languageCode
        limit @offset, @size
        let results = (
            for resourceType in attributes(doc.entities)
            for id in doc.entities[resourceType]
            return {
                compositeIdentifier: {
                    type: resourceType,
                    id
                }
            }
        )
        for r in results
        return distinct r
        `;

        const sizeToUse = size > 1000 || size < 1 ? 100 : size;

        const bindVars = {
            '@collectionName': this.collectionName,
            letter,
            languageCode,
            offset: (page - 1) * sizeToUse,
            size: sizeToUse,
        };

        const cursor = await this.database.query({ query: aql, bindVars });

        const result = (await cursor.all()) as {
            compositeIdentifier: { type: string; id: string };
        }[];

        return {
            page,
            count: result.length, // TODO make this the complete count for the collection?
            // can we do this in the database?
            entities: result,
        };
    }

    findByText(
        _searchText: string
    ): Promise<ResultOrError<PaginatedResponse<FullTextSearchRecord>>> {
        throw new Error('Method not implemented.');
    }
}
