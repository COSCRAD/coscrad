import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { bootstrapDynamicTypes } from '@coscrad/data-types';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../shared/multilingual-audio/multilingual-audio.entity';
import { EdgeConnectionContextUnion } from './edge-connection-context-union';
import { EdgeConnection } from './edge-connection.entity';
import { GeneralContext } from './general-context/general-context.entity';
import { PointContext } from './point-context/point-context.entity';
import { TimeRangeContext } from './time-range-context/time-range-context.entity';

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const existingTranslationOfNote = 'existing translation of note';

const existingTextNote = 'existing text note';

const existingBilingualNote = buildMultilingualTextFromBilingualText(
    { text: existingTextNote, languageCode: originalLanguageCode },
    { text: existingTranslationOfNote, languageCode: translationLanguageCode }
);

const existingMonolingualNote = buildMultilingualTextWithSingleItem(
    existingTextNote,
    originalLanguageCode
);

const existingEdgeConnectionWithoutAudioForNote = getValidAggregateInstanceForTest(
    AggregateType.note
).clone({
    note: existingBilingualNote,
    audioForNote: MultilingualAudio.buildEmpty(),
});

const audioItemId = buildDummyUuid(112);

describe(`EdgeConnection.AddAudioForNote`, () => {
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
    describe(`when the update is valid`, () => {
        describe(`when there is only an original note`, () => {
            const edgeConnection = existingEdgeConnectionWithoutAudioForNote.clone({
                note: existingMonolingualNote,
            });
            it(`should return the updated edge connection`, () => {
                const result = edgeConnection.addAudioForNote(audioItemId, originalLanguageCode);

                expect(result).toBeInstanceOf(EdgeConnection);

                const updatedEdgeConnection = result as unknown as EdgeConnection;

                const audioIdSearchResult =
                    updatedEdgeConnection.getAudioForNoteInLanguage(originalLanguageCode);

                expect(audioIdSearchResult).toBe(audioItemId);
            });
        });
    });
});
