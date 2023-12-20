import { isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { IMediaProber, RawMediaInfo } from './media-prober.interface';

/**
 * TODO Consider making this a nested entity with type decorators and behaviour.
 * If so, leverage this in `Photograph` class.
 */
export type PhotographDimensions = {
    heightPx: number;
    widthPx: number;
};

const ffprobe = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);

const parsePhotographDimensions = ({
    streams,
}: ffmpeg.FfprobeData): Maybe<PhotographDimensions> => {
    if (streams.length === 0) return NotFound;

    const {
        codec_long_name: codecLongName,
        coded_height: codedHeight,
        coded_width: codedWidth,
    } = streams[0];

    if (!codecLongName.includes('image')) {
        /**
         * Why does the `codec_type` come through as `video` for my
         * test PNG? Other properties clearly indicate that it is a png.
         */
        // TODO Can we apply these props to a video as well?
        return NotFound;
    }

    return {
        heightPx: codedHeight,
        widthPx: codedWidth,
    };
};

const parseDuration = ({ streams }: ffmpeg.FfprobeData): Maybe<number> => {
    if (streams.length === 0) return NotFound;

    const { codec_type: codecType, duration } = streams[0];

    const isAudioOrVideo = ['audio', 'video'].includes(codecType);

    if (!isAudioOrVideo) return NotFound;

    if (!isNonNegativeFiniteNumber(duration)) return NotFound;

    return duration;
};

export class FsMediaProber implements IMediaProber {
    async probe(filepath: string): Promise<Maybe<RawMediaInfo>> {
        const ffprobeResult = await ffprobe(filepath);

        const { streams = [] } = ffprobeResult;

        if (streams.length === 0) {
            return NotFound;
        }

        // TODO Be sure the 0th stream is always the one we want

        const dimensions = parsePhotographDimensions(ffprobeResult);

        const durationSeconds = parseDuration(ffprobeResult);

        // TODO Return this directly when done troubleshooting
        // TODO We need a better pattern for this
        const rawMediaInfo = {
            ...(isNotFound(durationSeconds) ? {} : { duration: durationSeconds }),
            ...(isNotFound(dimensions) ? {} : dimensions),
        };

        return rawMediaInfo;
    }
}
