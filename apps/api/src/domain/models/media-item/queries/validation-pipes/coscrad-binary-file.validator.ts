import { FileValidator } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import path = require('path');

type Options = {};

export class CoscradBinaryFileTypeValidator extends FileValidator<Options> {
    // This is someone else's abstraction. I am including empty options to satisfy their API
    constructor(validationOptions: Record<string, unknown>) {
        super(validationOptions);
    }

    /**
     * Indicates if this file should be considered valid, according to the options passed in the constructor.
     * @param file the file from the request object
     */
    async isValid(_file: Express.Multer.File): Promise<boolean> {
        throw new InternalError('not implemented');
        // const { ext, mime: mimeTypeFromMagicNumber } = await fileTypeFromStream(file.stream);

        // return getExpectedMimeTypeFromExtension(ext) === mimeTypeFromMagicNumber;
    }

    /**
     * Builds an error message in case the validation fails.
     * @param file the file from the request object
     */
    buildErrorMessage(file: Express.Multer.File): string {
        const actualExtension = path.extname(file.filename);

        return `The extension: ${actualExtension} is not consistent with the content type for the file: ${file.originalname}`;
    }
}
