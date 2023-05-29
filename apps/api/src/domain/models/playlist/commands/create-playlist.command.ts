import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { ExternalEnum, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
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
    label: 'Create Playlist',
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

    @NonEmptyString({
        label: 'name',
        description: 'name of the playlist',
    })
    name: string;

    @ExternalEnum(
        {
            enumLabel: `language code`,
            enumName: `LanguageCode`,
            labelsAndValues: Object.entries(LanguageCode).map(([label, languageCode]) => ({
                label,
                value: languageCode,
            })),
        },
        {
            label: 'language code',
            description: 'the language being used to name the playlist',
        }
    )
    languageCodeForName: LanguageCode;
}
