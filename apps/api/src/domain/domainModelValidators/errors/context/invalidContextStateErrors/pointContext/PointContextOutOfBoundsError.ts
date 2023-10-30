import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import formatBounds2D from '../../../../../../queries/presentation/formatBounds2D';
import formatPosition2D from '../../../../../../queries/presentation/formatPosition2D';
import { Position2D } from '../../../../../models/spatial-feature/types/Coordinates/Position2D';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';

export default class PointContextOutOfBoundsError extends InternalError {
    constructor(
        point: Position2D,
        bounds: [Position2D, Position2D],
        resourceCompositeIdentifier: AggregateCompositeIdentifier
    ) {
        const msg = [
            `The point: ${formatPosition2D(point)}`,
            `is out of the bounds`,
            formatBounds2D(bounds),
            `of resource: ${formatResourceCompositeIdentifier(resourceCompositeIdentifier)}`,
        ].join(' ');

        super(msg);
    }
}
