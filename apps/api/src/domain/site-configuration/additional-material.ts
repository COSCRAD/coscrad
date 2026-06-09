import { NestedDataType } from '@coscrad/data-types';
import { MediaContentBlock } from './media-content-block';
import { PdfContentBlock } from './pdf-content-block';

export class AdditionalMaterial {
    @NestedDataType(MediaContentBlock, {
        label: 'media',
        description: 'media for additional materials',
    })
    media: MediaContentBlock;

    @NestedDataType(PdfContentBlock, {
        label: 'media',
        description: 'media for additional materials',
    })
    pdf: PdfContentBlock;
}
