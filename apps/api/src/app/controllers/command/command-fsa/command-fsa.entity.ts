import { FluxStandardAction, ICommand } from '@coscrad/commands';
import { NonEmptyString } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';

export class CommandFSA implements FluxStandardAction {
    @ApiProperty()
    @NonEmptyString({
        label: 'type',
        description: 'type of command to execute',
    })
    readonly type: string;

    @ApiProperty()
    readonly payload: ICommand;
}
