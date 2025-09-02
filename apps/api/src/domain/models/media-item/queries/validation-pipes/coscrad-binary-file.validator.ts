import { isMIMEType } from '@coscrad/data-types';
import { FileValidator } from '@nestjs/common';

type Options = {};

/**
 * TODO [Linked to [this story](https://coscrad.atlassian.net/browse/CWEBJIRA-283).]
 * Use this in the media upload method in the media item controller.
 */
export class CoscradBinaryFileTypeValidator extends FileValidator<Options> {
    // This is someone else's abstraction. I am including empty options to satisfy their API
    constructor(validationOptions: Record<string, unknown>) {
        super(validationOptions);
    }

    /**
     * Indicates if this file should be considered valid, according to the options passed in the constructor.
     * @param file the file from the request object
     */
    async isValid(file: Express.Multer.File): Promise<boolean> {
        const { mimetype: mimeTypeFromMulter } = file;

        if (!isMIMEType(mimeTypeFromMulter)) {
            return false;
        }

        return true;

        // return getExpectedMimeTypeFromExtension(ext) === mimeTypeFromMagicNumber;
    }

    /**
     * Builds an error message in case the validation fails.
     * @param file the file from the request object
     */
    buildErrorMessage(file: Express.Multer.File): string {
        if (!isMIMEType(file.mimetype)) {
            return `Invalid MIME Type: ${file.mimetype}`;
        }
        // const actualExtension = path.extname(file.filename);

        // return `The extension: ${actualExtension} is not consistent with the content type for the file: ${file.originalname}`;
    }
}
