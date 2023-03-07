import { ResourceType } from '../../../types/ResourceType';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.playlist);

const invalidCases = buildAllInvalidTestCasesForResource(ResourceType.playlist);

export default () => ({
    validCases,
    invalidCases,
});
