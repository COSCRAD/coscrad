import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString, ReferenceTo, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { AggregateId } from '../../../../types/AggregateId';
import { MemoryMatchCardImportDto } from './memory-match-card-import.dto';

@CoscradDataExample<MemoryMatchRoundImportDto>({
    example: {
        cards: [],
        mediaItemIdForCardbackImage: buildDummyUuid(1),
        contributorId: buildDummyUuid(2),
        name: 'my imported memory match round',
        languageCodeForName: LanguageCode.Chilcotin,
        description: 'the best round ever',
        languageCodeForDescription: LanguageCode.English,
    },
})
export class MemoryMatchRoundImportDto {
    @NestedDataType(MemoryMatchCardImportDto, {
        label: 'card import records',
        description: 'a list of cards to import',
        isArray: true,
        isOptional: true, // can be empty
    })
    cards: MemoryMatchCardImportDto[];

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID for cardback image',
        description: `a system reference to the image used for the back of cards in this round`,
    })
    mediaItemIdForCardbackImage: AggregateId;

    /**
     * TODO We need to support contributors for each individual resource, including
     * - text
     * - images
     * - audio
     * - compiling the list
     */
    @ReferenceTo(AggregateType.contributor)
    @UUID({
        label: 'contributor ID',
        description: 'system reference to the contributor of information in this round',
    })
    contributorId: AggregateId;

    @NonEmptyString({
        label: 'name',
        description: 'the name of this memory round',
    })
    name: string;

    @LanguageCodeEnum({
        label: 'language code for name',
        description: 'the langauge in which you are naming this memory round',
    })
    languageCodeForName: LanguageCode;

    @NonEmptyString({
        label: 'description',
        description: 'a description of this memory round',
    })
    description: string;

    @LanguageCodeEnum({
        label: 'language code for description',
        description: 'the langauge in which you describing this memory round',
    })
    languageCodeForDescription: LanguageCode;
}
