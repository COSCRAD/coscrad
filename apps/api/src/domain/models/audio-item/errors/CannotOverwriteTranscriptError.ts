import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';

// We are keeping this general as it will be reused for video soon
export class CannotOverwriteTranscriptError extends InternalError {
    constructor(compositeIdentifier: ResourceCompositeIdentifier) {
        super(
            `You cannot create a transcript for ${formatAggregateCompositeIdentifier(
                compositeIdentifier
            )} as it already has one`
        );
    }
}
