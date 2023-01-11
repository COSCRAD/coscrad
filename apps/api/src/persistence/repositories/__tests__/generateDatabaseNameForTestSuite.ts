import { isNonEmptyString } from '@coscrad/validation-constraints';
import { InternalError } from '../../../lib/errors/InternalError';

import { TEST_DATABASE_PREFIX } from '../../constants/persistenceConstants';
import buildTestDatabaseNameFromFilePath from './buildTestDatabaseSuffixFromFilePath';

export default (): string => {
    const filePath = expect.getState().testPath;

    if (!isNonEmptyString(filePath)) {
        throw new InternalError(`Failed to obtain spec file path.`);
    }

    return `${TEST_DATABASE_PREFIX}_${buildTestDatabaseNameFromFilePath(filePath)}`;
};
