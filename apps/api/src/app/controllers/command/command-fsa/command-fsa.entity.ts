import { ICommandBase } from '@coscrad/api-interfaces';
import { FluxStandardAction } from '@coscrad/commands';
import { IsNonEmptyObject, IsStringWithNonzeroLength } from '@coscrad/validation';
import { ApiProperty } from '@nestjs/swagger';

export class CommandFSA<T extends ICommandBase = ICommandBase> implements FluxStandardAction {
    @ApiProperty()
    @IsStringWithNonzeroLength()
    readonly type: string;

    @ApiProperty()
    @IsNonEmptyObject()
    readonly payload: T;
}
