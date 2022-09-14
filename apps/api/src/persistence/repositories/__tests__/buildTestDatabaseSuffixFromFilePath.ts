import { InternalError } from '../../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../../lib/utilities/isStringWithNonzeroLength';

const separator = '/';

export default (filePath: string): string => {
    const directoriesAndFileName = filePath.split(separator);

    const fileName = directoriesAndFileName[directoriesAndFileName.length - 1];

    if (!isStringWithNonzeroLength(fileName)) {
        throw new InternalError(`failed to parse file name from path: ${filePath}`);
    }

    return fileName.split('.')[0];
};
