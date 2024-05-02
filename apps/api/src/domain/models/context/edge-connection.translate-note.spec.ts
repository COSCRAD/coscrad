import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../common/entities/errors';
import { MultilingualTextItem } from '../../common/entities/multilingual-text';
import { EdgeConnection } from './edge-connection.entity';

const existingLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const noteText = 'note';

const existingNote = buildMultilingualTextWithSingleItem(noteText, existingLanguageCode);

const edgeConnection = getValidAggregateInstanceForTest(AggregateType.note).clone({
    note: existingNote,
});

const translationOfNote = 'translation of note';

describe(`EdgeConnection.translateNote`, () => {
    describe(`when the translation is valid`, () => {
        it(`should return the translated note`, () => {
            const result = edgeConnection.translateNote(translationOfNote, translationLanguageCode);

            expect(result).toBeInstanceOf(EdgeConnection);

            const updatedEdgeConnection = result as EdgeConnection;

            const translationTextSearchResult =
                updatedEdgeConnection.note.getTranslation(translationLanguageCode);

            expect(translationTextSearchResult).not.toBe(NotFound);

            const newTextNote = translationTextSearchResult as MultilingualTextItem;

            const { text, role } = newTextNote;

            expect(text).toBe(translationOfNote);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`when the translation is invalid`, () => {
        describe(`when the translation and original languages are the same`, () => {
            it(`should return the expected error`, () => {
                const result = edgeConnection.translateNote(
                    translationOfNote,
                    translationLanguageCode
                );

                assertErrorAsExpected(
                    result,
                    new CannotAddDuplicateTranslationError(
                        new MultilingualTextItem({
                            text: translationOfNote,
                            languageCode: existingLanguageCode,
                            role: MultilingualTextItemRole.freeTranslation,
                        }),
                        edgeConnection.note
                    )
                );
            });
        });
    });
});
