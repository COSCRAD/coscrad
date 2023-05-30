import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { ExternalEnum, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export class PlayListCompositeId {
    // TODO Should we have an @FixedValue decorator instead?
    @ExternalEnum(
        {
            enumName: 'type',
            enumLabel: 'type',
            labelsAndValues: [
                {
                    label: 'type',
                    value: AggregateType.playlist,
                },
            ],
        },
        {
            label: 'type',
            description: AggregateType.playlist,
        }
    )
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
