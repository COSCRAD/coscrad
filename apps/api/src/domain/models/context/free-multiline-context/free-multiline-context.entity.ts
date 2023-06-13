import { FixedValue, NestedDataType, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import InvalidEdgeConnectionContextError from '../../../domainModelValidators/errors/context/InvalidEdgeConnectionContextError';
import validateSimpleInvariants from '../../../domainModelValidators/utilities/validateSimpleInvariants';
import validateAllCoordinatesInLinearStructure from '../../spatial-feature/validation/validateAllCoordinatesInLinearStructure';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export const EMPTY_DTO_INJECTION_TOKEN = 'EMPTY_DTO';

export class Point2DForContext {
    @NonNegativeFiniteNumber({
        isArray: true,
        description: 'a list of the form [x,y]',
        label: 'coordinates',
    })
    readonly coordinates: number[];

    constructor(dto: DTO<Point2DForContext>) {
        if (!dto) return;

        const { coordinates } = dto;

        // This is effectively a deep clone
        this.coordinates = [...coordinates];
    }

    getCoordinates(): [number, number] {
        return [...this.coordinates] as [number, number];
    }

    validateComplexInvariants(): ResultOrError<Valid> {
        // TODO check that there are exactly 2 points in coordinates
        return Valid;
    }
}

export class Line2DForContext {
    @NestedDataType(Point2DForContext, {
        isArray: true,
        description: 'a list of 2D points in this 2D line',
        label: 'points',
    })
    readonly points: Point2DForContext[];

    constructor(dto: DTO<Line2DForContext>) {
        if (!dto) return;

        const { points: lines } = dto;

        this.points = lines.map((line) => new Point2DForContext(line));
    }

    getCoordinates(): [number, number][] {
        return this.points.map((point) => point.getCoordinates());
    }
}

/**
 * A `free multiline` is a collection of one or more (typically
 * jagged) line segments specified as an ordered array of points. It's individual
 * lines are subject to no topological constraints. Figure eights, spirographs,
 * zig-zags, and so on are allowed.
 */

/**
 * TODO Restore support for free-multiline context once we have an edge connection factory.
 */

// @UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.freeMultiline)
export class FreeMultilineContext extends EdgeConnectionContext {
    @FixedValue({
        // EdgeConnectionType.freeMultiline,
        description: `must be ${EdgeConnectionContextType.freeMultiline}`,
        label: 'context type',
    })
    readonly type = EdgeConnectionContextType.freeMultiline;

    /**
     * TODO We need data classes for geometrical objects.
     */
    @NestedDataType(Line2DForContext, {
        isArray: true,
        description: 'a list of line segments that provide context for this resource or note',
        label: 'lines',
    })
    readonly lines: Line2DForContext[];

    constructor(dto: DTO<FreeMultilineContext>) {
        super();

        if (!dto) return;

        const { lines } = dto;

        // Avoid side-effects
        this.lines = lines.map((line) => new Line2DForContext(line));
    }

    /**
     * TODO Share this logic with `Aggregate` and also with other context models.
     *
     * Wouldn't mixins be nice here?
     */
    validateInvariants() {
        const simpleValidationResult = validateSimpleInvariants(
            Object.getPrototypeOf(this).constructor,
            this
        );

        const complexValidationResult = this.validateComplexInvariants();

        const allErrors = [...simpleValidationResult, ...complexValidationResult];

        return allErrors.length > 0
            ? new InvalidEdgeConnectionContextError(
                  EdgeConnectionContextType.freeMultiline,
                  allErrors
              )
            : Valid;
    }

    validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = this.lines.flatMap((line, index) => {
            const errorsForThisLine = validateAllCoordinatesInLinearStructure(line);

            if (errorsForThisLine.length > 0)
                return [
                    new InternalError(
                        `Encountered an invalid line at index: ${index} as part of a Free Mutliline Context.`,
                        errorsForThisLine
                    ),
                ];

            return [];
        });

        return allErrors;
    }

    getCoordinates(): [number, number][][] {
        return this.lines.map((line) => line.getCoordinates());
    }
}
