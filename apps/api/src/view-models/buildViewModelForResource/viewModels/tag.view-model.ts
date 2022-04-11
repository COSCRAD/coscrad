import { ApiProperty } from '@nestjs/swagger';
import { Tag } from 'apps/api/src/domain/models/tag/tag.entity';
import { BaseViewModel } from './base.view-model';

export class TagViewModel extends BaseViewModel {
    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    readonly text: string;

    constructor({ id, text }: Tag) {
        super({ id });

        this.text = text;
    }
}
