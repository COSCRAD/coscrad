import { LanguageCode } from '@coscrad/api-interfaces';
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
    text?: string;
    languageCodeForText?: string;
    mediaItemIdForAudio: AggregateId;
    mediaItemIdForImage: AggregateId;
}
