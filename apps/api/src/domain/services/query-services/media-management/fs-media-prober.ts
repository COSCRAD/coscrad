import { isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { MediaItemDimensions } from '../../../models/media-item/entities/media-item-dimensions';
import { IMediaProber, RawMediaInfo } from './media-prober.interface';

const ffprobe = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);

const parseMediaItemDimensions = ({ streams }: ffmpeg.FfprobeData): Maybe<MediaItemDimensions> => {
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

    return new MediaItemDimensions({
        heightPx: codedHeight,
        widthPx: codedWidth,
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

export class FsMediaProber implements IMediaProber {
    async probe(filepath: string): Promise<Maybe<RawMediaInfo>> {
        const ffprobeResult = await ffprobe(filepath);

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
