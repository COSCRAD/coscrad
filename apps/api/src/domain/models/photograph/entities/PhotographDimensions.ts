import { NonNegativeFiniteNumber } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

// TODO Consolidate this with `MediaItemDimensions`
// This is a value-object
export default class PhotographDimensions extends BaseDomainModel {
    @NonNegativeFiniteNumber({
        label: 'width (px)',
        description: 'the width of the photograph in pixels',
    })
    readonly widthPx: number;

    @NonNegativeFiniteNumber({
        label: 'height (px)',
        description: 'the height of the photograph in pixels',
    })
    readonly heightPx: number;

    constructor(dto: DTO<PhotographDimensions>) {
        super();

        if (!dto) return;

        const { widthPx: widthPX, heightPx: heightPX } = dto;

        this.widthPx = widthPX;

        this.heightPx = heightPX;
    }

    rescale(scaleFactor: number): PhotographDimensions {
        if (scaleFactor <= 0) {
            throw new InternalError(`Cannot scale photograph by invalid factor: ${scaleFactor}`);
        }

        return this.clone<PhotographDimensions>({
            widthPx: scaleFactor * this.widthPx,
            heightPx: scaleFactor * this.heightPx,
        });
    }
}
