import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../types/DTO';
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

    constructor(dto: DTO<AdditionalMaterial>) {
        if (!dto) return;

        const { media, pdf } = dto;

        this.media = media;

        this.pdf = pdf;
    }
}
