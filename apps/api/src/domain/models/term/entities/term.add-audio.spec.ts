import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotOverrideAudioForTermError } from '../errors';
import { Term } from './term.entity';

const term = getValidAggregateInstanceForTest(AggregateType.term).clone({
    audioItemId: undefined,
});

const audioItemId = buildDummyUuid(55);

describe(`Term.addAudio`, () => {
    describe(`when the input is valid`, () => {
        it(`should link the audio ID to the term`, () => {
            const result = term.addAudio(audioItemId);

            expect(result).toBeInstanceOf(Term);
        });
    });

    describe(`when the input in invalid`, () => {
        describe(`when the term already has audio`, () => {
            it(`should fail with the expected error`, () => {
                const termWithAudio = term.clone({ audioItemId: buildDummyUuid(1) });

                const result = termWithAudio.addAudio(audioItemId);

                assertErrorAsExpected(
                    result,
                    new CannotOverrideAudioForTermError(term.id, audioItemId)
                );
            });
        });

        describe(`when the audio id is an empty string`, () => {
            it(`should fail with an error`, () => {
                const result = term.addAudio('');

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
