import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class ValueAndDisplay<T> implements IValueAndDisplay<T> {
    @ApiProperty({
        example: '11',
        description: 'a string or boolean value to be used in filtering a vocabulary list',
    })
    public readonly value: T;

    @ApiProperty({
        example: 'I',
        description: 'the user-facing label for the given value',
    })
    public readonly display: string;
}
