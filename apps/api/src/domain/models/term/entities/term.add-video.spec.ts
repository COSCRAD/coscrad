import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotOverrideVideoForTermError } from '../errors/cannot-override-video-for-term.error';
import { Term } from './term.entity';

const existingTermWithNoVideo = buildTestInstance(Term, {
    videoId: undefined,
});

const videoId = buildDummyUuid(3);

describe(`Term.addVideo`, () => {
    describe(`when the does not have a video to start with`, () => {
        it(`should add the video`, () => {
            const result = existingTermWithNoVideo.addVideo(videoId);

            expect(result).not.toBeInstanceOf(InternalError);
        });
    });

    describe(`when there is already a photograph for the term`, () => {
        it(`should return the expected error`, () => {
            const existingTermThatHasAVideo = existingTermWithNoVideo.clone({
                videoId: buildDummyUuid(34),
            });

            const result = existingTermThatHasAVideo.addVideo(videoId);

            assertErrorAsExpected(
                result,
                new CannotOverrideVideoForTermError(
                    existingTermWithNoVideo.id,
                    videoId,
                    existingTermThatHasAVideo.videoId
                )
            );
        });
    });
});
