import { isNonEmptyString } from '@coscrad/validation-constraints';
import { InternalError } from '../../../lib/errors/InternalError';

const filePathSeparator = '/';

const fileNameSeparator = '.';

export default (filePath: string): string => {
    const directoriesAndFileName = filePath.split(filePathSeparator);

    const fileName = directoriesAndFileName[directoriesAndFileName.length - 1];

    if (!isNonEmptyString(fileName)) {
        throw new InternalError(`failed to parse file name from path: ${filePath}`);
    }

    return fileName.split(fileNameSeparator)[0];
};
