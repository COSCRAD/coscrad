import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';
import { IToPlainArray } from '../../interfaces/to-plain-array.interface';
import { LinearRing } from './linear-ring.entity';

export class Polygon2D extends BaseDomainModel implements IToPlainArray<number[][][]> {
    readonly rings: LinearRing[];

    constructor({ rings }: DTO<Polygon2D>) {
        super();

        this.rings = rings.map((ring) => new LinearRing(ring));
    }

    toPlainArray(): number[][][] {
        return this.rings.map((ring) => ring.toPlainArray());
    }
}
