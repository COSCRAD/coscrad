import { isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { IMediaProber, RawMediaInfo } from './media-prober.interface';

const ffprobe = promisify(ffmpeg.ffprobe);

export class FsMediaProber implements IMediaProber {
    async probe(filepath: string): Promise<Maybe<RawMediaInfo>> {
        const ffprobeResult = await ffprobe(filepath);

        const { streams = [] } = ffprobeResult;

        if (streams.length === 0) {
            return NotFound;
        }

        // TODO Be sure the 0th stream is always the one we want

        const { duration, codec_type: codecType } = streams[0];

        const isAudioOrVideo = ['audio', 'video'].includes(codecType);

        // TODO break out this logic
        if (isNullOrUndefined(duration) || !isAudioOrVideo || !isNonNegativeFiniteNumber(duration))
            return {};

        return { duration };
    }
}
