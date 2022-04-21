import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import formatPosition2D from 'apps/api/src/view-models/presentation/formatPosition2D';
import FreeMultilineContextOutOfBoundsError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/freeMultilineContext/FreeMultilineContextOutOfBoundsError';
import PointContextOutOfBoundsError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pointContext/PointContextOutOfBoundsError';
import { isValid, Valid } from '../../../domainModelValidators/Valid';
import { resourceTypes } from '../../../types/resourceTypes';
import { FreeMultilineContext } from '../../context/free-multiline-context/free-multiline-context.entity';
import { PointContext } from '../../context/point-context/point-context.entity';
import { Resource } from '../../resource.entity';
import PhotographDimensions from './PhotographDimensions';

export class Photograph extends Resource {
    readonly type = resourceTypes.photograph;

    readonly filename: string;

    // TODO make this a `contributorID`
    readonly photographer: string;

    // Should we really cache this here?
    readonly dimensions: PhotographDimensions;

    constructor(dto: PartialDTO<Photograph>) {
        super({ ...dto, type: resourceTypes.photograph });

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

    // TODO break out the validate point logic into a validation library instead
    validateFreeMultilineContext({ lines }: FreeMultilineContext): Valid | InternalError {
        const allErrors: InternalError[] = [];

        lines.forEach((line) => {
            const allErrorsForThisLine = line.reduce(
                (accumulatedErrors: InternalError[], point) => {
                    const pointValidationResult = this.validatePoint2DContext({
                        point,
                    } as PointContext);

                    return isValid(pointValidationResult)
                        ? accumulatedErrors
                        : accumulatedErrors.concat(
                              new InternalError(`Point out of bounds: ${formatPosition2D(point)}`)
                          );
                },
                []
            );

            allErrors.push(...allErrorsForThisLine);
        });

        if (allErrors.length > 0)
            return new FreeMultilineContextOutOfBoundsError(
                this.getCompositeIdentifier(),
                allErrors
            );

        return Valid;
    }

    validatePoint2DContext({ point }: PointContext): Valid | InternalError {
        const [x, y] = point;

        if (x < 0 || x > this.dimensions.widthPX || y < 0 || y > this.dimensions.heightPX)
            return new PointContextOutOfBoundsError(
                point,
                [this.dimensions.heightPX, this.dimensions.widthPX],
                this.getCompositeIdentifier()
            );

        return Valid;
    }
}
