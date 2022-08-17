import { NonNegativeFiniteNumber } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

// This is a value-object
export default class PhotographDimensions extends BaseDomainModel {
    @NonNegativeFiniteNumber()
    readonly widthPX: number;

    @NonNegativeFiniteNumber()
    readonly heightPX: number;

    constructor(dto: DTO<PhotographDimensions>) {
        super();

        if (!dto) return;

        const { widthPX, heightPX } = dto;

        this.widthPX = widthPX;

        this.heightPX = heightPX;
    }

    rescale(scaleFactor: number): PhotographDimensions {
        if (scaleFactor <= 0) {
            throw new InternalError(`Cannot scale photograph by invalid factor: ${scaleFactor}`);
        }

        return this.clone<PhotographDimensions>({
            widthPX: scaleFactor * this.widthPX,
            heightPX: scaleFactor * this.heightPX,
        });
    }
}
