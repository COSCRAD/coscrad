import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { Song } from '../song.entity';

export class CannotAddDuplicateSetOfLyricsForSongError extends InternalError {
    constructor(song: Song) {
        const msg = [
            `You cannot add lyrics for: ${formatAggregateCompositeIdentifier(
                song.getCompositeIdentifier()
            )}`,

            `as it already has lyrics.`,
        ].join(' ');

        super(msg);
    }
}
