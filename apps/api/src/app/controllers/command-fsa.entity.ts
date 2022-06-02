import { FluxStandardAction } from '@coscrad/commands';
import { ApiProperty } from '@nestjs/swagger';

export class CommandFSA implements FluxStandardAction {
    @ApiProperty()
    readonly type: string;

    @ApiProperty()
    readonly payload: Record<string, unknown>;
}
