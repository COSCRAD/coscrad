import { MIMEType } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';

/**
 * See the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
 */
const lookupTable: { [K in MIMEType]: string } = {
    [MIMEType.mp3]: 'mp3',
    [MIMEType.mp4]: 'mp4',
    [MIMEType.mov]: 'mov',
    [MIMEType.audioOgg]: 'oga',
    [MIMEType.png]: 'png',
    [MIMEType.bmp]: 'bmp',
    [MIMEType.jpg]: 'jpg',
    [MIMEType.svg]: 'svg',
    [MIMEType.wav]: 'wav',
    [MIMEType.videoOgg]: 'ogv',
    [MIMEType.videoWebm]: 'webm',
    [MIMEType.pdf]: 'pdf',
    [MIMEType.xlsx]: 'xlsx',
    [MIMEType.csv]: 'csv',
    [MIMEType.docx]: 'docx',
    [MIMEType.pptx]: 'pptx',
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

export const getExpectedMimeTypeFromExtension = (extension: string): MIMEType => {
    const searchResult = Object.entries(lookupTable).find(
        ([_mimeType, extensionForThisMimeType]) => extensionForThisMimeType === extension
    );

    if (!Array.isArray(searchResult)) {
        throw new InternalError(
            `failed to find a MIME type for unsupported extension: .${extension}`
        );
    }

    return searchResult[0] as MIMEType;
};
