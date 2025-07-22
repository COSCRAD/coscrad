import { ICommandBase } from '@coscrad/api-interfaces';
import { FluxStandardAction } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { AggregateId } from '../../../../domain/types/AggregateId';

/**
 * Note that the `userId` is appended internally to the system.
 */
export class ExternalCommandRecordMetaData {
    contributorIds: AggregateId[];
}

export class CommandFSA<T extends ICommandBase = ICommandBase> implements FluxStandardAction {
    @ApiProperty()
    @NonEmptyString({
        label: 'type',
        description: 'type of command to execute',
    })
    readonly type: string;

    @ApiProperty()
    readonly payload: T;

    @ApiProperty()
    @NestedDataType(ExternalCommandRecordMetaData, {
        label: 'meta',
        description: 'metadata about thecontributors, and date of execution for this command',
        isOptional: true,
    })
    readonly meta?: ExternalCommandRecordMetaData;
}
