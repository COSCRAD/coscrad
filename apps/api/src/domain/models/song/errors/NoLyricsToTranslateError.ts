import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class NoLyricsToTranslateError extends InternalError {
    constructor(songId: AggregateId) {
        super(
            `cannot translate lyrics as ${formatAggregateCompositeIdentifier({
                type: AggregateType.song,
                id: songId,
            })} does not yet have lyrics`
        );
    }
}
