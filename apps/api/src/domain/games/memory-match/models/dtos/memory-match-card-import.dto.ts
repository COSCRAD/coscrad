import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NonEmptyString, ReferenceTo, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';

@CoscradDataExample<MemoryMatchCardImportDto>({
    example: {
        text: 'word for this card',
        languageCodeForText: LanguageCode.English,
        mediaItemIdForAudio: buildDummyUuid(1),
        mediaItemIdForImage: buildDummyUuid(2),
    },
})
export class MemoryMatchCardImportDto {
    @NonEmptyString({
        label: 'text',
        description: `text for this card's phrase`,
        isOptional: true,
    })
    text?: string;

    @LanguageCodeEnum({
        label: 'language code for text',
        description: `the language code for this card's text`,
    })
    languageCodeForText?: string;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID for audio',
        description: `a system reference to the media item to be used for this card's audio`,
    })
    mediaItemIdForAudio: AggregateId;

    @UUID({
        label: 'media item ID for image',
        description: `a system reference to the media item to be used for this card's image`,
    })
    @ReferenceTo(AggregateType.mediaItem)
    mediaItemIdForImage: AggregateId;
}
