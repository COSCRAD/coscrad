import { isNonEmptyString } from '@coscrad/validation-constraints';
import { InternalError } from '../../../lib/errors/InternalError';
import path = require('path');

export default (filePath: string): string => {
    const extension = path.extname(filePath);

    const fileName = path.basename(filePath, extension);

    if (!isNonEmptyString(fileName)) {
        throw new InternalError(`failed to parse file name from path: ${filePath}`);
    }

    const withoutKeywords = fileName
        .replace(new RegExp('\\.', 'g'), '-')
        .replace(new RegExp('(integration|e2e|spec)', 'g'), '');

    let result = withoutKeywords;

    // The above replacements can lead to trailing occurrences of "-" so we remove these for readability
    while (result.endsWith('-')) {
        result = result.slice(0, result.length - 1);
    }

    return result;
};
