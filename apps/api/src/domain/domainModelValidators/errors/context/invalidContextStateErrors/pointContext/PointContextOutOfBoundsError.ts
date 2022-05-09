import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatBounds2D from '../../../../../../view-models/presentation/formatBounds2D';
import formatPosition2D from '../../../../../../view-models/presentation/formatPosition2D';
import formatResourceCompositeIdentifier from '../../../../../../view-models/presentation/formatResourceCompositeIdentifier';
import { Position2D } from '../../../../../models/spatial-feature/types/Coordinates/Position2D';
import { ResourceCompositeIdentifier } from '../../../../../models/types/ResourceCompositeIdentifier';

export default class PointContextOutOfBoundsError extends InternalError {
    constructor(
        point: Position2D,
        bounds: [Position2D, Position2D],
        resourceCompositeIdentifier: ResourceCompositeIdentifier
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
