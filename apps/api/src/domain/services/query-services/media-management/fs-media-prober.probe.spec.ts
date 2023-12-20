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

    // TODO add test for audio and video duration
});
