import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { PlaylistItem } from '../entities/playlist-item.entity';

export class CannotAddDuplicateItemToPlaylist extends InternalError {
    constructor(playlistId: AggregateId, playlistItem: PlaylistItem) {
        const msg = `You cannot add item: ${formatAggregateCompositeIdentifier(
            playlistItem.resourceCompositeIdentifier
        )} to ${formatAggregateCompositeIdentifier({
            type: AggregateType.playlist,
            id: playlistId,
        })} as this item is already on the playlist`;

        super(msg);
    }
}
