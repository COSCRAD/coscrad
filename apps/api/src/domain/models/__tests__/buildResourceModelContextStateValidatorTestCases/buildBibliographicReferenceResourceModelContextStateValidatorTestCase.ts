import { ResourceType } from '../../../types/ResourceType';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.bibliographicReference);

export default () => ({
    validCases,
    invalidCases: [...buildAllInvalidTestCasesForResource(ResourceType.bibliographicReference)],
});
