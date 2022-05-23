import { ApiProperty } from '@nestjs/swagger';
import { ICommand } from './ICommand';

export class TestCommand implements ICommand {
    type = 'TestCommand';

    @ApiProperty()
    foo: number;

    @ApiProperty()
    bar: string;
}
