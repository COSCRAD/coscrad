import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../../types/resourceTypes';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { Resource } from '../../resource.entity';
import PhotographDimensions from './PhotographDimensions';

export class Photograph extends Resource {
    readonly type = resourceTypes.photograph;

    readonly allowedContextTypes = [EdgeConnectionContextType.general];

    readonly filename: string;

    // TODO make this a `contributorID`
    readonly photographer: string;

    // Should we really cache this here?
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
