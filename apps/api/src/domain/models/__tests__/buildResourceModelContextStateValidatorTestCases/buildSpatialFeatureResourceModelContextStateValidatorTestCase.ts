import { resourceTypes } from '../../../types/resourceTypes';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInvalidTestCasesForResource';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.spatialFeature);

export default () => ({
    validCases,
    invalidCases: [...buildAllInvalidTestCasesForResource(resourceTypes.spatialFeature)],
});
