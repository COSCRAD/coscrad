import { AggregateId } from '../../../../domain/types/AggregateId';
import { Maybe } from '../../../../lib/types/maybe';
import { CommandFSA } from '../command-fsa/command-fsa.entity';
import { BulkCommandExecutionResult, CoscradBulkImportJob } from './bulk-import-job.entity';

export interface IBulkJobRepository {
    create(job: CoscradBulkImportJob): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<CoscradBulkImportJob>>;

    fetchMany(): Promise<CoscradBulkImportJob[]>;

    append(id: AggregateId, ...additionalCommands: CommandFSA[]): Promise<void>;

    registerResults(results: BulkCommandExecutionResult[], dateExecuted: number): Promise<void>;

    // delete(id: AggregateId): Promise<void>;
}
