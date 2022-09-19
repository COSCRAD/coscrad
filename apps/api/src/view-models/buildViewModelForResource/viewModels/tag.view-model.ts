import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../../../domain/models/tag/tag.entity';
import { BaseViewModel } from './base.view-model';

export class TagViewModel extends BaseViewModel {
    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    @FromDomainModel(Tag)
    readonly label: string;

    constructor({ id, label }: Tag) {
        super({ id });

        this.label = label;
    }
}
