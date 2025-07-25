import { Ack } from '@coscrad/commands';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AggregateId } from '../../../../domain/types/AggregateId';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument, {
    ArangoDatabaseDocument,
} from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { CommandFSA } from '../command-fsa/command-fsa.entity';
import { BulkCommandExecutionResult, CoscradBulkImportJob } from './bulk-import-job.entity';
import { IBulkJobRepository } from './bulk-job-repository.interface';

export const ARANGO_BULK_JOB_COLLECTION_NAME = 'bulk-import-jobs';

export class ArangoBulkJobRepository implements IBulkJobRepository {
    private readonly db: ArangoDatabaseForCollection<DTO<CoscradBulkImportJob>>;

    constructor(@Inject(ArangoConnectionProvider) connectionProvider: ArangoConnectionProvider) {
        const arangoDb = new ArangoDatabase(connectionProvider.getConnection());

        this.db = new ArangoDatabaseForCollection(arangoDb, ARANGO_BULK_JOB_COLLECTION_NAME);
    }

    async create(bulkJob: CoscradBulkImportJob): Promise<AggregateId> {
        const doc = this.instanceToArangoDoc(bulkJob);

        const query = `
            insert @newDoc in @@collectionName
            return NEW._key
        `;

        const bindVars = {
            '@collectionName': ARANGO_BULK_JOB_COLLECTION_NAME,
            newDoc: doc,
        };

        const cursor = await this.db.query({ query, bindVars }).catch((e) => {
            throw new InternalError(`Failed to create bulk job in Arango`, [
                new InternalError(e?.message || 'unknown Arango failure'),
            ]);
        });

        const result = await cursor.all();

        if (result.length !== 1) {
            // this is a system error and should never happen, but is a logical possiblity
            throw new InternalError(
                `Request to create a single bulk job returned multiple update records.`
            );
        }

        const returnedId = result[0] as unknown;

        if (!isNonEmptyString(returnedId)) {
            throw new InternalError(
                `Request to create a single bulk job returned an invalid ID: ${returnedId} (expected non-empty string)`
            );
        }

        return returnedId;
    }

    async fetchById(id: AggregateId): Promise<Maybe<CoscradBulkImportJob>> {
        const doc = await this.db.fetchById(id);

        if (isNotFound(doc)) {
            return NotFound;
        }

        return this.arangoDocToInstance(doc);
    }

    async fetchMany(): Promise<CoscradBulkImportJob[]> {
        const docs = await this.db.fetchMany();

        return docs.map((doc) => this.arangoDocToInstance(doc));
    }

    async append(
        id: AggregateId,
        ...additionalCommands: CommandFSA[]
    ): Promise<ResultOrError<AggregateId>> {
        /**
         * NOTE that we are moving to all lower case keywords instead of upper
         * case in AQL queries. We'll "strangle out" the old pattern as we have
         * occasion. Capital keywords are slow to type.
         *
         * TODO Use [`aql` tempate tag](https://arangodb.github.io/arangojs/devel/functions/aql.aql.html)
         * TODO Install [LSP support for AQL snippets](https://marketplace.visualstudio.com/items?itemName=monotykamary.vscode-aql)
         */
        const query = `
            for doc in @@collectionName
            filter doc._key == @id
            update doc with {
                stream: append(doc.stream == null ? [] : doc.stream,@additionalCommands)
            } in @@collectionName
            return NEW
        `;

        const bindVars = {
            '@collectionName': ARANGO_BULK_JOB_COLLECTION_NAME,
            id,
            additionalCommands,
        };

        const cursor = await this.db.query({ query, bindVars });

        const result = await cursor.all();

        if (result.length === 1 && result[0]?._key === id) {
            return id;
        }

        return new InternalError(
            `Failed to append tasks to a bulk job, as there is no bulk job with id: ${id}`
        );
    }

    async registerResults(
        jobId: AggregateId,
        results: BulkCommandExecutionResult[],
        dateExecuted: number
    ): Promise<ResultOrError<AggregateId>> {
        const query = `
            for doc in @@collectionName
            filter doc._key == @id
            let docUpdate = length(doc.results) > 0 ? {} :  {
                results: @newResults,
                dateExecuted: @dateExecuted
            }
            update doc with docUpdate in @@collectionName
            return docUpdate 
        `;

        const bindVars = {
            '@collectionName': ARANGO_BULK_JOB_COLLECTION_NAME,
            id: jobId,
            newResults: this.serializeResults(results),
            dateExecuted,
        };

        const cursor = await this.db.query({ query, bindVars });

        const queryResult = await cursor.all();

        if (queryResult.length !== 1) {
            return new InternalError(
                `Failed to register results for unknown bulk job with ID: ${jobId}`
            );
        }

        if (queryResult[0] === null) {
            throw new Error(`null check me, please!`);
        }

        return jobId;
    }

    private instanceToArangoDoc(
        entity: CoscradBulkImportJob
    ): ArangoDatabaseDocument<DTO<CoscradBulkImportJob>> {
        const serializedResults = this.serializeResults(entity.results);

        const plain = mapEntityDTOToDatabaseDocument<DTO<CoscradBulkImportJob>>(
            cloneToPlainObject(entity)
        );

        plain.results = serializedResults;

        return plain;
    }

    private serializeResults(results: CoscradBulkImportJob['results']) {
        return results?.map(({ result, fsa }) => ({
            fsa,
            result: result === Ack ? 'Ack' : result,
        }));
    }

    private arangoDocToInstance(doc: ArangoDatabaseDocument<DTO<CoscradBulkImportJob>>) {
        const hydratedResults = this.hydrateResults(doc.results);

        if (doc.results) delete doc.results;

        const instance = plainToClass(CoscradBulkImportJob, mapDatabaseDocumentToAggregateDTO(doc));

        instance.results = hydratedResults.length > 0 ? hydratedResults : null;

        return instance;
    }

    // TODO fix type
    private hydrateResults(results: any[]) {
        const hydratedResults = [];

        (results || []).forEach(({ fsa, result }) => {
            const hydrated = {
                fsa,
                result: result === 'Ack' ? Ack : result,
            } as const;

            hydratedResults.push(hydrated);
        });

        return hydratedResults;
    }
}
