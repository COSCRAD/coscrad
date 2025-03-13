import { NotFound } from '../../../../lib/types/not-found';
import { FsMediaProber } from './fs-media-prober';
import { RawMediaInfo } from './media-prober.interface';

const baseDir = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly`;

const buildMediaItemPath = (filename: string) => `${baseDir}/${filename}`;

const mediaProber = new FsMediaProber();

/**
 * Note that it is important that the expectation values for this test line
 * up with our test media items. Further, we do not `.gitignore` test media files
 * because we want the CI to use this same set when it runs tests.
 */
describe(`FSMediaProber.probe`, () => {
    describe(`when probing a png`, () => {
        const testPngFilepath = buildMediaItemPath(`station.png`);

        // actual properties determined via file explorer
        const expectedWidthPx = 960;

        const expectedHeightPx = 1280;

        it(`should discover the dimensions`, async () => {
            const result = await mediaProber.probe(testPngFilepath);

            expect(result).not.toBe(NotFound);

            const rawMediaInfo = result as RawMediaInfo;

            expect(rawMediaInfo.heightPx).toBe(expectedHeightPx);

            expect(rawMediaInfo.widthPx).toBe(expectedWidthPx);
        });
    });

    describe(`when probing a jpg`, () => {
        it(`should not have a duration`, async () => {
            const testJpgFile = buildMediaItemPath('desk-593327_640.jpg');

            const result = await mediaProber.probe(testJpgFile);

            expect(result).not.toBe(NotFound);

            expect((result as RawMediaInfo).durationSeconds).toBeUndefined();
        });
    });

    describe(`when probing an mp3`, () => {
        it(`should determine the correct duration`, async () => {
            const result = await mediaProber.probe(
                buildMediaItemPath('elemental-magic-spell-impact-outgoing-228342.mp3')
            );

            expect(result).not.toBe(NotFound);

            const { durationSeconds } = result as RawMediaInfo;

            const lengthDeterminedFromAudacity = 3.183;

            expect(durationSeconds).toBeCloseTo(lengthDeterminedFromAudacity, 1);
        });
    });

    describe(`when probing an mp4`, () => {
        it(`should return the correct duration`, async () => {
            const result = await mediaProber.probe(
                buildMediaItemPath('trees-reflect-into-the-lake.mp4')
            );

            expect(result).not.toBe(NotFound);

            const { durationSeconds } = result as RawMediaInfo;

            expect(durationSeconds).toBeCloseTo(13.3, 1);
        });
    });

    // // TODO[https://www.pivotaltracker.com/story/show/186726351] add test for audio and video duration
    // (
    //     [
    //         ['biodynamic-theme-song-forever.mp3', 8.35916],
    //         ['trees-reflect-into-the-lake.mp4', 13.3],
    //         ['coscrad-test-video.mov', 4.1],
    //     ] as const
    // ).forEach(([mediaFilename, expectedDuration]) => {
    //     describe(`when probing the media item: ${mediaFilename}`, () => {
    //         it(`should determine the correct duration`, async () => {
    //             const result = await mediaProber.probe(buildMediaItemPath(mediaFilename));

    //             expect(result).not.toBe(NotFound);

    //             const { durationSeconds } = result as RawMediaInfo;

    //             expect(durationSeconds).toBeCloseTo(expectedDuration, 1);
    //         });
    //     });
    // });
});
