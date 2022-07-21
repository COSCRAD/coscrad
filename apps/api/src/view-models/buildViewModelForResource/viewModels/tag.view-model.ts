import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../../../domain/models/tag/tag.entity';
import { BaseViewModel } from './base.view-model';

export class TagViewModel extends BaseViewModel {
    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    readonly label: string;

    constructor({ id, label }: Tag) {
        super({ id });

        this.label = label;
    }
}
