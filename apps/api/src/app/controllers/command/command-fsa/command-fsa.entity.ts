import { FluxStandardAction } from '@coscrad/commands';
import { IsStringWithNonzeroLength } from '@coscrad/validation';
import { ApiProperty } from '@nestjs/swagger';

export class CommandFSA implements FluxStandardAction {
    @ApiProperty()
    @IsStringWithNonzeroLength()
    readonly type: string;

    @ApiProperty()
    readonly payload: Record<string, unknown>;
}
