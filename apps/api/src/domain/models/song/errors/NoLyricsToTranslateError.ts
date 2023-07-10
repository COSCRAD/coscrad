import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { Song } from '../song.entity';

export class NoLyricsToTranslateError extends InternalError {
    constructor(song: Song) {
        super(
            `cannot translate lyrics as ${formatAggregateCompositeIdentifier(
                song
            )} does not yet have lyrics`
        );
    }
}
