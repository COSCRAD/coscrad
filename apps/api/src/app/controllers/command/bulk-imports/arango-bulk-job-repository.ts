import { Inject } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AggregateId } from '../../../../domain/types/AggregateId';
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

    async create(bulkJob: CoscradBulkImportJob): Promise<void> {
        const doc = this.instanceToArangoDoc(bulkJob);

        await this.db.create(doc);
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

    append(_id: AggregateId, ..._additionalCommands: CommandFSA[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    registerResults(_results: BulkCommandExecutionResult[], _dateExecuted: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private instanceToArangoDoc(
        entity: CoscradBulkImportJob
    ): ArangoDatabaseDocument<DTO<CoscradBulkImportJob>> {
        return mapEntityDTOToDatabaseDocument<DTO<CoscradBulkImportJob>>(
            cloneToPlainObject(entity)
        );
    }

    private arangoDocToInstance(doc: ArangoDatabaseDocument<DTO<CoscradBulkImportJob>>) {
        return plainToClass(CoscradBulkImportJob, mapDatabaseDocumentToAggregateDTO(doc));
    }
}
