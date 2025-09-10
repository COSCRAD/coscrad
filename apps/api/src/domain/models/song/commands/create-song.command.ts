import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    RawDataObject,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class SongCompositeId {
    @AggregateTypeProperty([AggregateType.song])
    type = AggregateType.song;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@CoscradDataExample<CreateSong>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(1),
        },
        title: 'I have a little lamb',
        languageCodeForTitle: LanguageCode.English,
        audioItemId: buildDummyUuid(2),
    },
})
@Command({
    type: 'CREATE_SONG',
    label: 'Create Song',
    description: 'Creates a new song',
})
export class CreateSong implements ICommandBase {
    @NestedDataType(SongCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<typeof AggregateType.song>;

    @NonEmptyString({
        isOptional: true,
        label: 'title',
        description: "song's title in the given language",
    })
    readonly title: string;

    @LanguageCodeEnum({
        label: 'language for title',
        description: 'the language in which you are naming this song',
    })
    readonly languageCodeForTitle: LanguageCode;

    @UUID({
        label: 'media item ID',
        description: `reference to the song's audio item`,
    })
    @ReferenceTo(AggregateType.audioItem)
    readonly audioItemId: AggregateId;

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description: 'additional data from a legacy \\ third-party system source of the data',
    })
    readonly rawData?: Record<string, unknown>;
}
