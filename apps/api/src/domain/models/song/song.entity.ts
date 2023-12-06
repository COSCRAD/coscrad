import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateType,
    ICommandBase,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString, ReferenceTo } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../queries/presentation/formatAggregateCompositeIdentifier';
import { DTO } from '../../../types/DTO';
import { DeepPartial } from '../../../types/DeepPartial';
import { ResultOrError } from '../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../common/entities/multilingual-text';
import { AggregateRoot } from '../../decorators';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { Resource } from '../resource.entity';
import { BaseEvent } from '../shared/events/base-event.entity';
import { ContributorAndRole } from './ContributorAndRole';
import { AddLyricsForSong, TranslateSongLyrics, TranslateSongTitle } from './commands';
import { CreateSong } from './commands/create-song.command';
import {
    ADD_LYRICS_FOR_SONG,
    LYRICS_ADDED_FOR_SONG,
    SONG_LYRICS_TRANSLATED,
    TRANSLATE_SONG_LYRICS,
} from './commands/translate-song-lyrics/constants';
import {
    SONG_TITLE_TRANSLATED,
    TRANSLATE_SONG_TITLE,
} from './commands/translate-song-title/constants';
import { CannotAddDuplicateSetOfLyricsForSongError, NoLyricsToTranslateError } from './errors';
import { SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError } from './errors/SongLyricsAlreadyHaveBeenTranslatedToGivenLanguageError';

const isOptional = true;

@AggregateRoot(AggregateType.song)
@RegisterIndexScopedCommands(['CREATE_SONG'])
export class Song extends Resource {
    readonly type = ResourceType.song;

    @NestedDataType(MultilingualText, {
        label: 'title',
        description: 'the title of the song',
    })
    readonly title: MultilingualText;

    // @NestedDataType(ContributorAndRole, {
    //     isArray: true,
    //     label: 'contributions',
    //     description: 'summary of contributions to the creation and recording of the song',
    // })
    // @deprecated Remove this in favor of edge connections to a Contributor resource
    readonly contributions?: ContributorAndRole[];

    @NestedDataType(MultilingualText, {
        isOptional,
        label: 'lyrics',
        description: 'the lyrics of the song',
    })
    // the type of `lyrics` should allow three way translation in future
    readonly lyrics?: MultilingualText;

    @NonEmptyString({
        label: 'media item ID',
        description: `reference to the corresponding audio item`,
    })
    @ReferenceTo(AggregateType.audioItem)
    readonly audioItemId: string;

    constructor(dto: DTO<Song>) {
        super({ ...dto, type: ResourceType.song });

        if (!dto) return;

        const { title, contributions: contributorAndRoles, lyrics, audioItemId: mediaItemId } = dto;

        this.title = new MultilingualText(title);

        this.contributions = (contributorAndRoles || []).map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        if (!isNullOrUndefined(lyrics)) this.lyrics = new MultilingualText(lyrics);

        this.audioItemId = mediaItemId;
    }

    getName(): MultilingualText {
        return this.title.clone();
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        const lyricsCommands = this.hasLyrics() ? [TRANSLATE_SONG_LYRICS] : [ADD_LYRICS_FOR_SONG];

        return [TRANSLATE_SONG_TITLE, ...lyricsCommands];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { title } = this;

        const titleValidationResult = title.validateComplexInvariants();

        const titleValidationErrors = isInternalError(titleValidationResult)
            ? [titleValidationResult]
            : [];

        return allErrors.concat(titleValidationErrors);
    }

    static fromEventHistory(
        eventStream: BaseEvent[],
        idOfSongToCreate: AggregateId
    ): Maybe<ResultOrError<Song>> {
        // TODO ensure events are temporally sorted first
        const eventsForThisSong = eventStream.filter(({ payload }) =>
            isDeepStrictEqual((payload as ICommandBase)[AGGREGATE_COMPOSITE_IDENTIFIER], {
                type: AggregateType.song,
                id: idOfSongToCreate,
            })
        );

        if (eventsForThisSong.length === 0) return NotFound;

        const [creationEvent, ...updateEvents] = eventsForThisSong;

        if (creationEvent.type !== `SONG_CREATED`) {
            throw new InternalError(
                `The first event for ${formatAggregateCompositeIdentifier({
                    type: AggregateType.song,
                    id: idOfSongToCreate,
                })} should have been of type SONG_CREATED, but found: ${creationEvent?.type}`
            );
        }

        // Note that the event payload is currently just a record of the successful command payload. In the future, we need separate types \ mapping layer.
        const {
            title,
            languageCodeForTitle,
            aggregateCompositeIdentifier: { id, type },
            audioItemId,
        } = creationEvent.payload as CreateSong;

        const initialInstance = new Song({
            type,
            id,
            audioItemId,
            published: false,
            title: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            eventHistory: [creationEvent],
        });

        const newSong = updateEvents.reduce(
            // TODO Ensure the eventStream is sorted
            (song, event) => {
                // If application of any event failed, short circuit
                if (isInternalError(song)) return song;

                if (event.type === SONG_TITLE_TRANSLATED) {
                    const { translation, languageCode } = event.payload as TranslateSongTitle;

                    // TODO Wrap in the add event behaviour so we don't need to repeat it and risk forgetting it
                    return song.addEventToHistory(event).translateTitle(translation, languageCode);
                }

                if (event.type === LYRICS_ADDED_FOR_SONG) {
                    const { lyrics, languageCode } = event.payload as AddLyricsForSong;

                    return song.addEventToHistory(event).addLyrics(lyrics, languageCode);
                }

                if (event.type === SONG_LYRICS_TRANSLATED) {
                    const { translation, languageCode } = event.payload as TranslateSongLyrics;

                    return song.addEventToHistory(event).translateLyrics(translation, languageCode);
                }

                if (event.type === `RESOURCE_PUBLISHED`) {
                    return song.addEventToHistory(event).publish();
                }
            },
            initialInstance
        );

        // TODO Validate invariants as in the factories? Or leave this to the repositories?
        return newSong;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    /**
     * Adds lyrics for a song that does not yet have any lyrics. To translate
     * existing lyrics (`original` item in multilingual-text valued `lyrics`),
     * use `translateLyrics` instead.
     */
    addLyrics(text: string, languageCode: LanguageCode): ResultOrError<Song> {
        if (this.hasLyrics()) return new CannotAddDuplicateSetOfLyricsForSongError(this);

        return this.safeClone({
            lyrics: new MultilingualText({
                items: [
                    new MultilingualTextItem({
                        text,
                        languageCode,
                        role: MultilingualTextItemRole.original,
                    }),
                ],
            }),
        } as DeepPartial<DTO<this>>);
    }

    translateTitle(translation: string, languageCode: LanguageCode): ResultOrError<Song> {
        // return error if there is already a translation in languageCode
        const newTitle = this.title.translate(
            new MultilingualTextItem({
                text: translation,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );

        if (isInternalError(newTitle)) return newTitle;

        return this.safeClone<Song>({
            title: newTitle,
        });
    }

    translateLyrics(text: string, languageCode: LanguageCode): ResultOrError<Song> {
        if (!this.hasLyrics()) return new NoLyricsToTranslateError(this.id);

        if (this.hasTranslation(languageCode))
            return new SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError(
                this.id,
                languageCode
            );

        return this.translateMultilingualTextProperty('lyrics', {
            text,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }

    hasLyrics(): boolean {
        return this.lyrics instanceof MultilingualText;
    }

    hasTranslation(languageCode: LanguageCode): boolean {
        if (!this.hasLyrics()) return false;

        const searchResult = this.lyrics.getTranslation(languageCode);

        return !isNotFound(searchResult);
    }
}
