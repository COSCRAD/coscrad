import { AggregateId } from '../../../../domain/types/AggregateId';
import { Maybe } from '../../../../lib/types/maybe';
import { ResultOrError } from '../../../../types/ResultOrError';
import { CommandFSA } from '../command-fsa/command-fsa.entity';
import { BulkCommandExecutionResult, CoscradBulkImportJob } from './bulk-import-job.entity';

export const BULK_JOB_REPOSITORY_INJECTION_TOKEN = 'BULK_JOB_REPOSITORY_INJECTION_TOKEN';

export interface IBulkJobRepository {
    create(job: CoscradBulkImportJob): Promise<AggregateId>;

    fetchById(id: AggregateId): Promise<Maybe<CoscradBulkImportJob>>;

    fetchMany(): Promise<CoscradBulkImportJob[]>;

    append(
        jobId: AggregateId,
        ...additionalCommands: CommandFSA[]
    ): Promise<ResultOrError<AggregateId>>;

    registerResults(
        jobId: AggregateId,
        results: BulkCommandExecutionResult[],
        dateExecuted: number
    ): Promise<ResultOrError<AggregateId>>;
}
