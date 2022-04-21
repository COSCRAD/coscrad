import { resourceTypes } from '../../../types/resourceTypes';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.transcribedAudio);

export default () => ({
    validCases,
    invalidCases: [],
});
