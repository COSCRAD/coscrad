import { LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { AggregateId } from '../../../../types/AggregateId';

// TODO share this with API interfaces
@CoscradDataExample<MemoryMatchRoundCreationDto>({
    example: {
        name: `Bob's Memory Round`,
        languageCodeForName: LanguageCode.English,
        description: 'The best round ever',
        languageCodeForDescription: LanguageCode.English,
        cardBackImageId: buildDummyUuid(99),
    },
})
export class MemoryMatchRoundCreationDto {
    name: string;
    languageCodeForName: LanguageCode;
    description: string;
    languageCodeForDescription: LanguageCode;
    cardBackImageId?: AggregateId; // setting this is optional
}
