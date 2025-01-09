import {
    AggregateCompositeIdentifier,
    AggregateType,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { FromDomainModel, URL } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AudioItem } from '../../../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { CoscradContributor } from '../../../domain/models/user-management/contributor';
import { AggregateId } from '../../../domain/types/AggregateId';
import { BaseResourceViewModel } from './base-resource.view-model';

const FromTerm = FromDomainModel(Term);

export class TermViewModel extends BaseResourceViewModel implements ITermViewModel {
    // We should wrap the API Property using the View Model Schemas!
    @ApiPropertyOptional({
        example: 'https://www.mysound.org/audio/hetellsstories.mp3',
        description: 'a url for an audio recording of the given term in the language',
    })
    @URL({
        label: 'audio link',
        description: "a web link to a digital audio recording of this term's pronunciation",
    })
    readonly audioURL?: string;

    @ApiPropertyOptional({
        example: 'Digital Verb Book v 1.0',
        description:
            'the name of the project through which this term was documented (if applicable)',
    })
    @FromTerm
    readonly sourceProject?: string;

    readonly mediaItemId?: string;

    readonly isPublished: boolean;

    readonly accessControlList: { allowedUserIds: string[]; allowedGroupIds: string[] };

    constructor(
        term: Term,
        audioItems: AudioItem[],
        mediaItems: MediaItem[],
        contributors: CoscradContributor[]
    ) {
        super(term, contributors);

        const { audio, sourceProject, text, queryAccessControlList, published } = term;

        this.isPublished = published;

        if (sourceProject) this.sourceProject = sourceProject;

        this.accessControlList = queryAccessControlList.clone();

        const originalLanguageCode = text.getOriginalTextItem().languageCode;

        /**
         * TODO Expose the full multilingual audio
         */
        const audioItemId = audio.hasAudioIn(originalLanguageCode)
            ? (audio.getIdForAudioIn(originalLanguageCode) as AggregateId)
            : undefined;

        if (isNonEmptyString(audioItemId)) {
            const audioSearchResult = audioItems.find(({ id }) => id === audioItemId);

            if (audioSearchResult) {
                const { mediaItemId } = audioSearchResult;

                const mediaItemSearchResult = mediaItems.find(({ id }) => id === mediaItemId);

                if (isNonEmptyString(mediaItemSearchResult?.url)) {
                    this.audioURL = `/resources/mediaItems/download/${mediaItemSearchResult.id}`;
                }
            }
        }
    }

    public getAvailableCommands(): string[] {
        // TODO add the logic here or remove this class if it's not going to be used
        return [];
    }

    public getCompositeIdentifier(): AggregateCompositeIdentifier {
        return {
            type: AggregateType.term,
            id: this.id,
        };
    }
}
