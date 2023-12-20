import { NonNegativeFiniteNumber } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

export class MediaItemDimensions extends BaseDomainModel {
    @NonNegativeFiniteNumber({
        label: 'height (px)',
        description: 'the height of the media item in pixels',
    })
    public readonly heightPx: number;

    @NonNegativeFiniteNumber({
        label: 'width (px)',
        description: 'the width of the media item in pixels',
    })
    public readonly widthPx: number;

    constructor(dto: DTO<MediaItemDimensions>) {
        super();

        if (!dto) return;

        const { heightPx, widthPx } = dto;

        this.heightPx = heightPx;

        this.widthPx = widthPx;
    }
}
