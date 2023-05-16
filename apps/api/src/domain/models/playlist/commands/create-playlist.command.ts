import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { CoscradMultilingualText, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export class PlayListCompositeId {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @NonEmptyString({
        label: 'type',
        description: 'song',
    })
    type = AggregateType.playlist;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: 'CREATE_PLAYLIST',
    label: 'Create PLaylist',
    description: 'Creates a new playlist',
})
export class CreatePlayList implements ICommandBase {
    @NestedDataType(PlayListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.playlist
    >;

    @CoscradMultilingualText({
        label: 'name',
        description: 'the name of the playlist',
    })
    readonly name: MultilingualText;
}
