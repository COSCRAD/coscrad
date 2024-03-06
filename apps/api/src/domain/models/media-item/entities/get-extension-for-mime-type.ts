import { MIMEType } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';

/**
 * See the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
 */
const lookupTable = {
    [MIMEType.mp3]: 'mp3',
    [MIMEType.mp4]: 'mp4',
    [MIMEType.audioOgg]: 'oga',
    [MIMEType.png]: 'png',
    [MIMEType.wav]: 'wav',
    [MIMEType.videoOgg]: 'ogv',
    [MIMEType.videoWebm]: 'webm',
    [MIMEType.pdf]: 'pdf',
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

export const getExpectedMimeTypeFromExtension = (extension: string) => {
    const searchResult = Object.entries(lookupTable).find(
        ([_mimeType, extensionForThisMimeType]) => extensionForThisMimeType === extension
    );

    if (!Array.isArray(searchResult)) {
        throw new InternalError(
            `failed to find a MIME type for unsupported extension: .${searchResult[1]}`
        );
    }

    return searchResult[0];
};
