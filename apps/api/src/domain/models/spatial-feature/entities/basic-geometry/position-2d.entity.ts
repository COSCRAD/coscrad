import { NonNegativeFiniteNumber } from '../../../../../../../../libs/data-types/src';
import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';
import { IToPlainArray } from '../../interfaces/to-plain-array.interface';

export class Position2D extends BaseDomainModel implements IToPlainArray<number[]> {
    @NonNegativeFiniteNumber({ isArray: true })
    readonly coordinates: number[];

    constructor({ coordinates }: DTO<Position2D>) {
        super();

        this.coordinates = Array.isArray(coordinates) ? [...coordinates] : null;
    }

    toPlainArray(): number[] {
        return [...this.coordinates];
    }
}
