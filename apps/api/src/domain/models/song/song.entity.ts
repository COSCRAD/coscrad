import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import { isNotFound } from '../../../lib/types/not-found';
import { DTO } from '../../../types/DTO';
import { DeepPartial } from '../../../types/DeepPartial';
import { ResultOrError } from '../../../types/ResultOrError';
import { MultilingualText, MultilingualTextItem } from '../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../types/ResourceType';
import { TimeRangeContext } from '../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../interfaces/ITimeBoundable';
import { Resource } from '../resource.entity';
import validateTimeRangeContextForModel from '../shared/contextValidators/validateTimeRangeContextForModel';
import { ContributorAndRole } from './ContributorAndRole';
import { CannotAddDuplicateSetOfLyricsForSongError, NoLyricsToTranslateError } from './errors';
import { SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError } from './errors/SongLyricsAlreadyHaveBeenTranslatedToGivenLanguageError';

const isOptional = true;

@RegisterIndexScopedCommands(['CREATE_SONG'])
export class Song extends Resource implements ITimeBoundable {
    readonly type = ResourceType.song;

    // @NonEmptyString({
    //     isOptional,
    //     label: 'title',
    //     description: 'the title of the song in the language',
    // })
    // readonly title?: string;

    // @NonEmptyString({
    //     isOptional,
    //     label: 'title (colonial language)',
    //     description: 'the title of the song in the colonial language',
    // })
    // readonly titleEnglish?: string;

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

    @URL({ label: 'audio URL', description: 'a web link to the audio for the song' })
    readonly audioURL: string;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: 'length of the audio file in milliseconds',
    })
    readonly lengthMilliseconds: number;

    // TODO Consider removing this if it's not needed
    @NonNegativeFiniteNumber({
        label: 'start (ms)',
        description: 'the starting timestamp for the audio file',
    })
    readonly startMilliseconds: number;

    constructor(dto: DTO<Song>) {
        super({ ...dto, type: ResourceType.song });

        if (!dto) return;

        const {
            title,
            contributions: contributorAndRoles,
            lyrics,
            audioURL,
            lengthMilliseconds,
            startMilliseconds,
        } = dto;

        this.title = new MultilingualText(title);

        this.contributions = (contributorAndRoles || []).map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        if (!isNullOrUndefined(lyrics)) this.lyrics = new MultilingualText(lyrics);

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }

    getName(): MultilingualText {
        return this.title.clone();
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { startMilliseconds, lengthMilliseconds, title } = this;

        if (startMilliseconds > lengthMilliseconds)
            allErrors.push(
                new InternalError(
                    `the start:${startMilliseconds} cannot be greater than the length:${lengthMilliseconds}`
                )
            );

        const titleValidationResult = title.validateComplexInvariants();

        const titleValidationErrors = isInternalError(titleValidationResult)
            ? [titleValidationResult]
            : [];

        return allErrors.concat(titleValidationErrors);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): ValidationResult {
        return validateTimeRangeContextForModel(this, timeRangeContext);
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

    translateTitle(_translation: string, _languageCode: LanguageCode): ResultOrError<Song>{
        // return error if there is already a translation in languageCode
        throw new Error('not implmented')
    }

    translateLyrics(text: string, languageCode: LanguageCode): ResultOrError<Song> {
        if (!this.hasLyrics()) return new NoLyricsToTranslateError(this);

        if (this.hasTranslation(languageCode))
            return new SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError(this, languageCode);

        const newLyrics = this.lyrics.translate(
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );

        if (isInternalError(newLyrics)) return newLyrics;

        return this.safeClone<Song>({
            lyrics: newLyrics,
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

    getTimeBounds(): [number, number] {
        return [this.startMilliseconds, this.getEndMilliseconds()];
    }

    getEndMilliseconds(): number {
        return this.startMilliseconds + this.lengthMilliseconds;
    }
}
