import { MIMEType } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';

const lookupTable = {
    [MIMEType.mp3]: 'mp3',
    [MIMEType.mp4]: 'mp4',
    [MIMEType.audioOgg]: 'ogg',
    [MIMEType.png]: 'png',
    [MIMEType.wav]: 'wav',
    // TODO Double check these
    // [MIMEType.videoOgg]: 'ogg',
    // [MIMEType.videoWebm]: '?'
} as const;

// TODO Reuse this in CLI commands
export const getExtensionForMimeType = (mimeType: MIMEType): string => {
    const searchResult = lookupTable[mimeType];

    if (!isNonEmptyString(searchResult)) {
        throw new InternalError(
            `failed to find and extension for unsupported MIME type: ${mimeType}`
        );
    }

    return searchResult;
};
