import { NestedDataType } from '@coscrad/data-types';
import { Media } from './media';
import { PDF } from './pdf';

export class AdditionalMaterial {
    @NestedDataType(Media, {
        label: 'media',
        description: 'media for additional materials',
    })
    media: Media;

    @NestedDataType(PDF, {
        label: 'media',
        description: 'media for additional materials',
    })
    pdf: PDF;
}
