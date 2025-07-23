import { Ack } from '@coscrad/commands';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../domain/models/__tests__/utilities/dummyDateNow';
import { AggregateId } from '../../../../domain/types/AggregateId';
import { InternalError } from '../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { ResultOrError } from '../../../../types/ResultOrError';
import { CommandFSA } from '../command-fsa/command-fsa.entity';
import { CoscradBulkImportJobCreateDto } from './bulk-import-job.create-dto.entity';

export class BulkCommandExecutionResult {
    fsa: CommandFSA;

    result: Ack | string;
}

@CoscradDataExample<CoscradBulkImportJob>({
    example: {
        id: buildDummyUuid(1),
        name: 'my test bulk import job',
        dateCreated: dummyDateNow,
        stream: [],
    },
})
export class CoscradBulkImportJob {
    readonly id: AggregateId;

    readonly name: string;

    sourceProject?: string;

    readonly dateCreated: number;

    dateExecuted?: number;

    stream: CommandFSA[];

    results?: BulkCommandExecutionResult[];

    // calculate a status instead- draft, pending, success, failure?
    public didSucceed() {
        return this.results.length > 0 && this.results.every(({ result }) => result === Ack);
    }

    public validateInvariants(): InternalError[] {
        return [];
    }

    /**
     * Append additional command FSAs to a draft import job.
     */
    public append(..._fsas: CommandFSA[]): ResultOrError<CoscradBulkImportJob> {
        throw new InternalError('not implemented');
    }

    public reportResults(results: BulkCommandExecutionResult[]): ResultOrError<this> {
        // TODO validate results has correct FSAs and length

        // TODO do not allow overwriting existing results

        this.results = results;

        return this;
    }

    /**
     *
     * @param dto A creation DTO, which is **not** dynamically generated from `DTO<CsocradBulkImportJob>`
     */
    public static fromCreateDto(
        _dto: CoscradBulkImportJobCreateDto
    ): ResultOrError<CoscradBulkImportJob> {
        throw new InternalError('not implemented');
    }
}
