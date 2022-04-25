import { Position2D } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/Position2D';
import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import formatBounds2D from 'apps/api/src/view-models/presentation/formatBounds2D';
import formatPosition2D from 'apps/api/src/view-models/presentation/formatPosition2D';
import formatResourceCompositeIdentifier from 'apps/api/src/view-models/presentation/formatResourceCompositeIdentifier';

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
