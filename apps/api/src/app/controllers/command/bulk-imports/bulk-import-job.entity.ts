import { Ack } from '@coscrad/commands';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { plainToClass } from 'class-transformer';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../domain/models/__tests__/utilities/dummyDateNow';
import { AggregateId } from '../../../../domain/types/AggregateId';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { CommandFSA } from '../command-fsa/command-fsa.entity';
import { CoscradBulkImportJobCreateDto } from './bulk-import-job.create-dto.entity';

export class BulkCommandExecutionResult {
    fsa: CommandFSA;

    result: Ack | string;
}

@CoscradDataExample<BulkJobViewModel>({
    example: {
        id: buildDummyUuid(1),
        name: 'my test bulk import job',
        dateCreated: dummyDateNow,
        stream: [],
    },
})
export class BulkJobViewModel {
    readonly id: AggregateId;

    readonly name: string;

    sourceProject?: string;

    readonly dateCreated: number;

    dateExecuted?: number;

    stream: CommandFSA[];

    results?: BulkCommandExecutionResult[];
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

    constructor(dto: DTO<CoscradBulkImportJob>) {
        if (!dto) {
            return;
        }

        const { id, name, sourceProject, dateCreated, dateExecuted, stream, results } = dto;

        this.id = id;

        this.name = name;

        this.sourceProject = sourceProject;

        this.dateCreated = dateCreated;

        this.dateExecuted = dateExecuted;

        this.stream = stream.map(cloneToPlainObject);

        if (Array.isArray(results)) {
            this.results = results.map(cloneToPlainObject);
        }
    }

    public isDraft(): boolean {
        return (
            (isNullOrUndefined(this.results) || this.results?.length === 0) &&
            isNullOrUndefined(this.dateExecuted)
        );
    }

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

    public toViewDto(): BulkJobViewModel {
        const view = plainToClass(BulkJobViewModel, this);

        return view;
    }

    /**
     *
     * @param dto A creation DTO, which is **not** dynamically generated from `DTO<CsocradBulkImportJob>`
     */
    public static fromCreateDto(
        dto: CoscradBulkImportJobCreateDto & { id: AggregateId }
    ): ResultOrError<CoscradBulkImportJob> {
        if (!dto) {
            return;
        }

        const { id, name, stream, sourceProject } = dto;

        return new CoscradBulkImportJob({
            id,
            name,
            sourceProject,
            dateCreated: Date.now(),
            stream,
        });
    }
}
