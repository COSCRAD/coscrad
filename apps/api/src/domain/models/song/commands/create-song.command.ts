import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    RawDataObject,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
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

@Command({
    type: 'CREATE_SONG',
    label: 'Create Song',
    description: 'Creates a new song',
})
export class CreateSong implements ICommandBase {
    /**
     * TODO
     * We need a migration for this schema change. The migration will
     * remove `id`
     * add `aggregateId` = `id` => ({id, type: AggregateType.song})
     *
     * Before merging this in, we need to get a 'snapshot' of the previous
     * schema (system-wide), which will become v1. We want to persist the history
     * of such changes for posterity.
     */
    // @UUID({
    //     label: 'ID (generated)',
    //     description: 'unique identifier for the song that will be created',
    // })
    // readonly id: AggregateId;

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

    // the length can be set later
}
