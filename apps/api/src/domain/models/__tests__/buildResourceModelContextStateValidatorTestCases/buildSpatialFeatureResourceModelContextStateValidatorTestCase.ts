import { resourceTypes } from '../../../types/resourceTypes';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.spatialFeature);

export default () => ({
    validCases,
    invalidCases: [],
});
