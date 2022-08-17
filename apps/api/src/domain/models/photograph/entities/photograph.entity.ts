import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import findAllPointsInLineNotWithinBounds from '../../../../lib/validation/geometry/findAllPointsInLineNotWithinBounds';
import isPointWithinBounds from '../../../../lib/validation/geometry/isPointWithinBounds';
import { DTO } from '../../../../types/DTO';
import formatPosition2D from '../../../../view-models/presentation/formatPosition2D';
import FreeMultilineContextOutOfBoundsError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/freeMultilineContext/FreeMultilineContextOutOfBoundsError';
import PointContextOutOfBoundsError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pointContext/PointContextOutOfBoundsError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { FreeMultilineContext } from '../../context/free-multiline-context/free-multiline-context.entity';
import { PointContext } from '../../context/point-context/point-context.entity';
import { Boundable2D } from '../../interfaces/Boundable2D';
import { Resource } from '../../resource.entity';
import { Position2D } from '../../spatial-feature/types/Coordinates/Position2D';
import PhotographDimensions from './PhotographDimensions';

@RegisterIndexScopedCommands([])
export class Photograph extends Resource implements Boundable2D {
    readonly type = ResourceType.photograph;

    readonly filename: string;

    // TODO make this a `contributorID`
    @NonEmptyString()
    readonly photographer: string;

    @NestedDataType(PhotographDimensions)
    readonly dimensions: PhotographDimensions;

    constructor(dto: DTO<Photograph>) {
        super({ ...dto, type: ResourceType.photograph });

        if (!dto) return;

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

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    // TODO break out the validate point logic into a validation library instead
    validateFreeMultilineContext({ lines }: FreeMultilineContext): Valid | InternalError {
        const allErrors: InternalError[] = lines.reduce(
            (accumulatedErrors: InternalError[], line, index) => {
                const invalidPointsForThisLine = findAllPointsInLineNotWithinBounds(
                    line,
                    this.getGeometricBounds()
                );

                if (invalidPointsForThisLine.length > 0) {
                    const invalidPointsMessage = invalidPointsForThisLine.reduce(
                        (accumulatedMessage, { index, point }) =>
                            accumulatedMessage.concat(
                                `index: ${index},`,
                                `point: ${formatPosition2D(point)}`,
                                '\n'
                            ),
                        ''
                    );

                    // TODO: Break this out into a dedicated error
                    return accumulatedErrors.concat(
                        new InternalError(
                            `Invalid line at index: ${index} in free multiline context. \n Invalid points: ${invalidPointsMessage}`
                        )
                    );
                }

                return accumulatedErrors;
            },
            []
        );

        if (allErrors.length > 0)
            return new FreeMultilineContextOutOfBoundsError(
                this.getCompositeIdentifier(),
                allErrors
            );

        return Valid;
    }

    validatePoint2DContext({ point }: PointContext): Valid | InternalError {
        if (!isPointWithinBounds(point, ...this.getGeometricBounds()))
            return new PointContextOutOfBoundsError(
                point,
                this.getGeometricBounds(),
                this.getCompositeIdentifier()
            );

        return Valid;
    }

    /**
     * @returns [height,width]
     */
    getGeometricBounds(): [Position2D, Position2D] {
        return [
            [0, this.dimensions.heightPX],
            [0, this.dimensions.widthPX],
        ];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
