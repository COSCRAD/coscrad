import { ResourceType } from '../../../types/ResourceType';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.song);
const inconsistentContextTypeTestCases = buildAllInvalidTestCasesForResource(ResourceType.song);

export default () => ({
    validCases,
    invalidCases: [...inconsistentContextTypeTestCases],
});
