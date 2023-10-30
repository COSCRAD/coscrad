import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { Playlist } from '../entities';

export class FailedToImportAudioItemsError extends InternalError {
    constructor(playlist: Playlist, innerErrors: InternalError[]) {
        const msg = `failed to add one or more items to playlist: ${formatAggregateCompositeIdentifier(
            playlist.getCompositeIdentifier()
        )}`;

        super(msg, innerErrors);
    }
}
