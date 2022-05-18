import { resourceTypes } from '../../../types/resourceTypes';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInvalidTestCasesForResource';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.bibliographicReference);

export default () => ({
    validCases,
    invalidCases: [...buildAllInvalidTestCasesForResource(resourceTypes.bibliographicReference)],
});
