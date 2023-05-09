import { ITagViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { CategorizableCompositeIdentifier } from '../../../domain/models/categories/types/ResourceOrNoteCompositeIdentifier';
import { Tag } from '../../../domain/models/tag/tag.entity';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from './base.view-model';

export class TagViewModel extends BaseViewModel implements ITagViewModel {
    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    @FromDomainModel(Tag)
    readonly label: string;

    @FromDomainModel(Tag)
    readonly members: CategorizableCompositeIdentifier[];

    constructor(tag: Tag) {
        super(tag);

        const { label, members } = tag;

        this.label = label;

        // Avoid shared references- composite IDs are plain objects not instances in our system
        this.members = cloneToPlainObject(members);
    }
}
