import { InternalError } from '../../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../../lib/utilities/isStringWithNonzeroLength';
import { TEST_DATABASE_PREFIX } from '../../constants/persistenceConstants';
import buildTestDatabaseNameFromFilePath from './buildTestDatabaseSuffixFromFilePath';

export default (): string => {
    const filePath = expect.getState().testPath;

    if (!isStringWithNonzeroLength(filePath)) {
        throw new InternalError(`Failed to obtain spec file path.`);
    }

    return `${TEST_DATABASE_PREFIX}_${buildTestDatabaseNameFromFilePath(filePath)}`;
};
