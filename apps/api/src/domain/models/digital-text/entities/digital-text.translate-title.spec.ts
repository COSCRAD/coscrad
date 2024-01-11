import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NotFound } from '../../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import { DigitalText } from './digital-text.entity';

const existingLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const originalTitleText = 'original title';

const existingTitle = buildMultilingualTextWithSingleItem(originalTitleText, existingLanguageCode);

const digitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    title: existingTitle,
});

describe(`DigitalText.translateTitle`, () => {
    describe(`when the translation is valid`, () => {
        const translationOfTitle = `translation of title`;

        it(`should return the updated title`, () => {
            const result = digitalText.translateTitle(translationOfTitle, translationLanguageCode);

            expect(result).toBeInstanceOf(DigitalText);

            const updatedDigitalText = result as DigitalText;

            const translationTextSearchResult =
                updatedDigitalText.title.getTranslation(translationLanguageCode);

            expect(translationTextSearchResult).not.toBe(NotFound);

            const newTextItem = translationTextSearchResult as MultilingualTextItem;

            const { text, role } = newTextItem;

            expect(text).toBe(translationOfTitle);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });
});
