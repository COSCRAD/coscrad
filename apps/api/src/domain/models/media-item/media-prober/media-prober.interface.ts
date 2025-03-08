import { Readable } from 'stream';
import { Maybe } from '../../../../lib/types/maybe';

export const MEDIA_PROBER_TOKEN = `MEDIA_PROBER_TOKEN`;

/**
 * TODO We may want a discriminated union where we can correlate the
 * properties that are required with the MIME Type.
 */
export type RawMediaInfo = {
    durationSeconds?: number;
    // TODO Consider leveraging `MediaItemDimensions` here
    heightPx?: number;
    widthPx?: number;
};

/**
 * Eventually, we will support imports from S3 bucket compliant storage and
 * potentially other mechanisms. Also, we may break out a separate media management
 * service that could potentially be deployed out of process. For that reason,
 * we want to keep things loosely coupled to `fs` and `ffmpeg`.
 */
export interface IMediaProber {
    /**
     * In the future we may want to support
     * - probeDir (recursively)
     * - probe(streamOfBinaryData)
     * - probe(mediaItemId -> external service)
     * - probe(externalUrl)
     */
    probe(input: string | Readable): Promise<Maybe<RawMediaInfo>>;
}
