import { resourceTypes } from '../../../types/resourceTypes';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.bibliographicReference);

export default () => ({
    validCases,
    invalidCases: [...buildAllInvalidTestCasesForResource(resourceTypes.bibliographicReference)],
});
