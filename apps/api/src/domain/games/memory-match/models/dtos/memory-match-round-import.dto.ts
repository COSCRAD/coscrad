import { LanguageCode } from '@coscrad/api-interfaces';
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
    cards: MemoryMatchCardImportDto[];
    mediaItemIdForCardbackImage: AggregateId;
    contributorId: AggregateId;
    name: string;
    languageCodeForName: LanguageCode;
    description: string;
    languageCodeForDescription: LanguageCode;
}
