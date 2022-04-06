import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import BaseDomainModel from '../../BaseDomainModel';

// This is a value-object
export default class PhotographDimensions extends BaseDomainModel {
    // Do we need the unit in the prop name? Do we need other units?
    readonly widthPX: number;

    readonly heightPX: number;

    constructor({ widthPX, heightPX }: PartialDTO<PhotographDimensions>) {
        super();

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
