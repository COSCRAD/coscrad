import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { ExternalEnum, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export class PlayListCompositeId {
    // TODO [https://github.com/COSCRAD/coscrad/pull/392#discussion_r1210655537] Should we have an @FixedValue decorator instead?
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

    @LanguageCodeEnum({
        label: 'language code for name',
        description: 'the language in which you are naming this playlist',
    })
    languageCodeForName: LanguageCode;
}
