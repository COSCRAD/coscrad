import { ApiProperty } from '@nestjs/swagger';
import { Tag } from 'apps/api/src/domain/models/tag/tag.entity';
import { EntityId } from 'apps/api/src/domain/models/types/EntityId';

export class TagViewModel {
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies a tag amongst other tags',
    })
    readonly id: EntityId;

    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    readonly text: string;

    constructor({ id, text }: Tag) {
        this.id = id;

        this.text = text;
    }
}
