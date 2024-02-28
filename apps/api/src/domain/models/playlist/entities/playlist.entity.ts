import { NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../common/entities/multilingual-text';
import { UpdateMethod } from '../../../decorators';
import { isValid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { DuplicateLanguageInMultilingualTextError } from '../../audio-visual/audio-item/errors/duplicate-language-in-multilingual-text.error';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../build-aggregate-root-from-event-history';
import { Resource } from '../../resource.entity';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { AudioItemAddedToPlaylist } from '../commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event';
import { AudioItemsImportedToPlaylist } from '../commands/import-audio-items-to-playlist/audio-items-imported-to-playlist.event';
import { PlaylistCreated } from '../commands/playlist-created.event';
import { PlaylistNameTranslated } from '../commands/translate-playlist-name/playlist-name-translated.event';
import { CannotAddDuplicateItemToPlaylist } from '../errors';
import { FailedToImportAudioItemsError } from '../errors/failed-to-import-audio-items.error';
import { PlaylistItem } from './playlist-item.entity';

@RegisterIndexScopedCommands(['CREATE_PLAYLIST'])
export class Playlist extends Resource {
    readonly type = ResourceType.playlist;

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'the name of the playlist',
    })
    name: MultilingualText;

    // TODO add refrence to a photograph

    @NestedDataType(PlaylistItem, {
        label: 'playlist items',
        description: "the resources from which the playlist's episodes are derived",
        isArray: true,
        // i.e. can be an empty array
        isOptional: true,
    })
    readonly items: PlaylistItem[];

    constructor(dto: DTO<Playlist>) {
        super(dto);

        if (!dto) return;

        const { name, items } = dto;

        this.name = new MultilingualText(name);

        if (Array.isArray(items)) this.items = items.map((item) => new PlaylistItem(item));
    }

    getName(): MultilingualText {
        return this.name;
    }

    has(aggregateCompositeIdentifierToFind: AggregateCompositeIdentifier): boolean {
        const result = this.items.some(({ resourceCompositeIdentifier }) =>
            isDeepStrictEqual(resourceCompositeIdentifier, aggregateCompositeIdentifierToFind)
        );

        return result;
    }

    @UpdateMethod()
    addItem(item: PlaylistItem): ResultOrError<Playlist> {
        if (this.has(item.resourceCompositeIdentifier))
            return new CannotAddDuplicateItemToPlaylist(this.id, item);

        this.items.push(item);

        return this;
    }

    @UpdateMethod()
    addItems(items: PlaylistItem[]): ResultOrError<Playlist> {
        const duplicateItems = items.filter((item) => this.has(item.resourceCompositeIdentifier));

        if (duplicateItems.length > 0)
            return new FailedToImportAudioItemsError(
                this,
                duplicateItems.map((item) => new CannotAddDuplicateItemToPlaylist(this.id, item))
            );

        this.items.push(...items);

        return this;
    }

    @UpdateMethod()
    translateName(textItem: MultilingualTextItem): ResultOrError<Playlist> {
        if (this.name.items.some(({ languageCode }) => languageCode === textItem.languageCode))
            return new DuplicateLanguageInMultilingualTextError(textItem.languageCode);

        const nameUpdateResult = this.name.translate(textItem);

        if (isInternalError(nameUpdateResult)) return nameUpdateResult;

        this.name = nameUpdateResult;

        return this;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return ['ADD_AUDIO_ITEM_TO_PLAYLIST', 'TRANSLATE_PLAYLIST_NAME'];
    }

    protected validateComplexInvariants(): InternalError[] {
        const nameValidationResult = this.name.validateComplexInvariants();

        return isValid(nameValidationResult) ? [] : [nameValidationResult];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        return this.items.map(({ resourceCompositeIdentifier }) => resourceCompositeIdentifier);
    }

    handlePlaylistNameTranslated({
        payload: { text, languageCode },
    }: PlaylistNameTranslated): ResultOrError<Playlist> {
        return this.translateName(
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }

    handleAudioItemAddedToPlaylist({ payload: { audioItemId } }: AudioItemAddedToPlaylist) {
        return this.addItem(
            new PlaylistItem({
                resourceCompositeIdentifier: {
                    type: AggregateType.audioItem,
                    id: audioItemId,
                },
            })
        );
    }

    handleAudioItemsImportedToPlaylist({
        payload: { audioItemIds },
    }: AudioItemsImportedToPlaylist) {
        return this.addItems(
            audioItemIds.map(
                (id) =>
                    new PlaylistItem({
                        resourceCompositeIdentifier: {
                            type: ResourceType.audioItem,
                            id,
                        },
                    })
            )
        );
    }

    static fromEventHistory(
        eventStream: BaseEvent[],
        playlistId: AggregateId
    ): Maybe<ResultOrError<Playlist>> {
        const creationEventHandlerMap: CreationEventHandlerMap<Playlist> = new Map().set(
            `PLAYLIST_CREATED`,
            Playlist.buildPlaylistFromPlaylistCreated
        );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.playlist,
                id: playlistId,
            },
            eventStream
        );
    }

    private static buildPlaylistFromPlaylistCreated(
        event: PlaylistCreated
    ): ResultOrError<Playlist> {
        const {
            aggregateCompositeIdentifier: { id: playlistId },
            name,
            languageCodeForName,
        } = event.payload;

        const buildResult = new Playlist({
            type: AggregateType.playlist,
            id: playlistId,
            published: false,
            items: [],
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
        });

        const invariantValidationResult = buildResult.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                'failed to build playlist due to invalid existing event history',
                [invariantValidationResult]
            );
        }

        return buildResult;
    }
}
