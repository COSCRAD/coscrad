import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../../types/entityTypes';
import { Entity } from '../../entity';
import PhotographDimensions from './PhotographDimensions';

export class Photograph extends Entity {
    readonly type = entityTypes.photograph;

    readonly filename: string;

    // TODO make this a `contributorID`
    readonly photographer: string;

    readonly dimensions: PhotographDimensions;

    constructor(dto: PartialDTO<Photograph>) {
        super(dto);

        const { filename, photographer, dimensions: dimensionsDTO } = dto;

        this.filename = filename;

        this.photographer = photographer;

        this.dimensions = new PhotographDimensions(dimensionsDTO);
    }

    rescale(scaleFactor: number) {
        // Note that input validation is deferred to `PhotographDimensions` method
        return this.clone<Photograph>({
            dimensions: this.dimensions.rescale(scaleFactor).toDTO(),
        });
    }
}
