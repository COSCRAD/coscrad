import { Position2D } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/Position2D';
import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import formatPosition2D from 'apps/api/src/view-models/presentation/formatPosition2D';
import formatResourceCompositeIdentifier from 'apps/api/src/view-models/presentation/formatResourceCompositeIdentifier';

// TODO refactor using format helpers in presentation layer
const formatPointsAsList = (points: Position2D[]): string =>
    points
        .reduce(
            (accumulatedString, point) => accumulatedString.concat(formatPosition2D(point), ','),
            ''
        )
        // remove trailing ','
        .slice(0, -1);

export default class FreeMultilineContextOutOfBoundsError extends InternalError {
    constructor(
        resourceCompositeIdentifier: ResourceCompositeIdentifier,
        innerErrors: InternalError[]
    ) {
        const msg = [
            `Free multiline context`,
            `refers to lines that are inconsistent with`,
            `resource: ${formatResourceCompositeIdentifier(resourceCompositeIdentifier)}`,
            '\n',
            `See inner errors for more details.`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
