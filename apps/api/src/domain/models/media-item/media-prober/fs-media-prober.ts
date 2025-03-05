import { isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { MediaItemDimensions } from '../entities/media-item-dimensions';
import { IMediaProber, RawMediaInfo } from './media-prober.interface';

const ffprobe = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);

const parseMediaItemDimensions = ({ streams }: ffmpeg.FfprobeData): Maybe<MediaItemDimensions> => {
    if (streams.length === 0) return NotFound;

    const {
        codec_long_name: codecLongName,
        coded_height: codedHeight,
        coded_width: codedWidth,
        height,
        width,
    } = streams[0];

    if (!['image', 'JPEG', 'BMP'].some((prefix) => codecLongName.includes(prefix))) {
        /**
         * Why does the `codec_type` come through as `video` for my
         * test PNG? Other properties clearly indicate that it is a png.
         */
        // TODO Can we apply these props to a video as well?
        return NotFound;
    }

    return new MediaItemDimensions({
        heightPx: codedHeight || height,
        widthPx: codedWidth || width,
    });
};

const parseDuration = ({ streams }: ffmpeg.FfprobeData): Maybe<number> => {
    if (streams.length === 0) return NotFound;

    const { codec_type: codecType, duration } = streams[0];

    const isAudioOrVideo = ['audio', 'video'].includes(codecType);

    if (!isAudioOrVideo) return NotFound;

    if (!isNonNegativeFiniteNumber(duration)) return NotFound;

    return duration;
};

/**
 * Note that the sub-type of RawMediaInfo that comes back is dependent on the
 * codec of the ffprobe result, which is not known statically. For instance,
 * JPEGs sometimes have a `duration` property, yet we do not want to expose
 * this in COSCRAD.
 *
 * A better pattern is to have a factory function that builds `RawMediaInfo`
 * based on pattern matching `ffprobeResult` against the codec info.
 *
 * ```ts
 * if(isVideoMeta(ffprobeResult)){
 *  return new RawVideoMetadata(ffprobeResult)
 * }
 *
 * // etc.
 * ```
 *
 * We might want custom probe errors for when things don't line up. The best way
 * to gain confidence is to probe a wide variety of media items in the wild and
 * iterate on this with regression tests as issues come up.
 */
export class FsMediaProber implements IMediaProber {
    async probe(filepath: string): Promise<Maybe<RawMediaInfo>> {
        const ffprobeResult = await ffprobe(filepath).catch((message) => {
            throw new InternalError(
                `FS Media Prober failed due to ffmpeg failure when processing the file: ${filepath}`,
                [new InternalError(message)]
            );
        });

        const { streams = [] } = ffprobeResult;

        if (streams.length === 0) {
            return NotFound;
        }

        // TODO Be sure the 0th stream is always the one we want
        const dimensions = parseMediaItemDimensions(ffprobeResult);

        const durationSeconds = parseDuration(ffprobeResult);

        // TODO Return this directly when done troubleshooting
        // TODO We need a better pattern for this
        const rawMediaInfo = {
            ...(isNotFound(durationSeconds) ? {} : { durationSeconds }),
            ...(isNotFound(dimensions) ? {} : dimensions.toDTO()),
        };

        return rawMediaInfo;
    }
}
