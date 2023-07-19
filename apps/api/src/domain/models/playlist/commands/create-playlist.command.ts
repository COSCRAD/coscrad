import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class PlayListCompositeId {
    @AggregateTypeProperty([AggregateType.playlist])
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
