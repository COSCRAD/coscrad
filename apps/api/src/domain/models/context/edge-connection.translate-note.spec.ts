import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { bootstrapDynamicTypes } from '@coscrad/data-types';
import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../common/entities/errors';
import { MultilingualTextItem } from '../../common/entities/multilingual-text';
import InvariantValidationError from '../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../types/AggregateType';
import { EdgeConnectionContextUnion } from './edge-connection-context-union';
import { EdgeConnection } from './edge-connection.entity';
import { GeneralContext } from './general-context/general-context.entity';
import { PointContext } from './point-context/point-context.entity';
import { TimeRangeContext } from './time-range-context/time-range-context.entity';

const existingLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const originalNoteText = 'original note';

const existingNote = buildMultilingualTextWithSingleItem(originalNoteText, existingLanguageCode);

const edgeConnection = getValidAggregateInstanceForTest(AggregateType.note).clone({
    note: existingNote,
});

const translationOfNote = 'translation of note';

describe(`EdgeConnection.translateNote`, () => {
    beforeAll(() => {
        // TODO: use the edge connection module as a source of truth context
        bootstrapDynamicTypes([
            EdgeConnectionContextUnion,
            GeneralContext,
            TimeRangeContext,
            PointContext,
            EdgeConnection,
        ]);
    });

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
                    existingLanguageCode
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

        describe(`when the translation is an empty string`, () => {
            it(`should return an invarient validation error`, () => {
                const result = edgeConnection.translateNote('', translationLanguageCode);

                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(edgeConnection.getCompositeIdentifier(), [])
                );
            });
        });
    });
});
