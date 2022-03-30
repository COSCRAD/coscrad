import { ApiProperty } from '@nestjs/swagger';

export class Message {
    @ApiProperty({
        example: 'Welcome',
        description: 'A welcome message that lets you know you are in the right place',
    })
    public readonly message: string;
}
