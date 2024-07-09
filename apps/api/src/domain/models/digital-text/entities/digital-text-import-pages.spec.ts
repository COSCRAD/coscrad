import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { DigitalText } from '.';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';

const pageIdentifier = '6v';

const textContent = 'Hello world';

const translation = 'hello world translated';

const audioItemId = buildDummyUuid(1);

const photographId = buildDummyUuid(2);

const originalLangaugeCode = LanguageCode.Chinook;

const translationLanguageCode = LanguageCode.Chilcotin;

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [],
});

describe(`DigitalText.ImportPages`, () => {
    describe(`when the page is imported with all optional properties specified`, () => {
        it(`should succeed`, () => {
            const result = existingDigitalText.importPages([
                {
                    pageIdentifier,
                    text: textContent,
                    languageCodeForText: originalLangaugeCode,
                    translation,
                    languageCodeForTranslation: translationLanguageCode,
                    audioItemId,
                    photographId,
                },
            ]);

            expect(result).toBeInstanceOf(DigitalText);
        });
    });
});
