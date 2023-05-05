import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NonEmptyString, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import { DTO } from '../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../common/entities/multilingual-text';
import MissingSongTitleError from '../../domainModelValidators/errors/song/MissingSongTitleError';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../types/ResourceType';
import { TimeRangeContext } from '../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../interfaces/ITimeBoundable';
import { Resource } from '../resource.entity';
import validateTimeRangeContextForModel from '../shared/contextValidators/validateTimeRangeContextForModel';
import { ContributorAndRole } from './ContributorAndRole';

const isOptional = true;

@RegisterIndexScopedCommands(['CREATE_SONG'])
export class Song extends Resource implements ITimeBoundable {
    readonly type = ResourceType.song;

    @NonEmptyString({
        isOptional,
        label: 'title',
        description: 'the title of the song in the language',
    })
    readonly title?: string;

    @NonEmptyString({
        isOptional,
        label: 'title (colonial language)',
        description: 'the title of the song in the colonial language',
    })
    readonly titleEnglish?: string;

    // @NestedDataType(ContributorAndRole, {
    //     isArray: true,
    //     label: 'contributions',
    //     description: 'summary of contributions to the creation and recording of the song',
    // })
    // @deprecated Remove this in favor of edge connections to a Contributor resource
    readonly contributions?: ContributorAndRole[];

    @NonEmptyString({ isOptional, label: 'lyrics', description: 'the lyrics of the song' })
    // the type of `lyrics` should allow three way translation in future
    readonly lyrics?: string;

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
            titleEnglish,
            contributions: contributorAndRoles,
            lyrics,
            audioURL,
            lengthMilliseconds,
            startMilliseconds,
        } = dto;

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributions = (contributorAndRoles || []).map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }

    getName(): MultilingualText {
        /**
         *  TODO confirm no migration is required (no live data for this) and
         * change `title` to a `MultilingualText`
         */
        return buildMultilingualTextWithSingleItem(this.title, LanguageCode.Chilcotin).append(
            new MultilingualTextItem({
                text: this.titleEnglish,
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { startMilliseconds, lengthMilliseconds, title, titleEnglish } = this;

        if (startMilliseconds > lengthMilliseconds)
            allErrors.push(
                new InternalError(
                    `the start:${startMilliseconds} cannot be greater than the length:${lengthMilliseconds}`
                )
            );

        if (!isNonEmptyString(title) && !isNonEmptyString(titleEnglish))
            allErrors.push(new MissingSongTitleError());

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): ValidationResult {
        return validateTimeRangeContextForModel(this, timeRangeContext);
    }

    getTimeBounds(): [number, number] {
        return [this.startMilliseconds, this.getEndMilliseconds()];
    }

    getEndMilliseconds(): number {
        return this.startMilliseconds + this.lengthMilliseconds;
    }
}
