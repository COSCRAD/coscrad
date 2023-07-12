import InconsistentTimeRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { ResourceType } from '../../../types/ResourceType';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import {
    ContextStateValidatorTestCase,
    ResourceModelContextStateValidatorInvalidTestCase,
} from '../resourceModelContextStateValidators.spec';
import buildAllInconsistentContextTypeTestCases from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.mediaItem);

const inconsistentContextTypeTestCases = buildAllInconsistentContextTypeTestCases(
    ResourceType.mediaItem
);

const validMediaItem = validCases[0].resource;

const invalidTimeRangeContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,
    timeRange: {
        inPointMilliseconds: 0,
        outPointMilliseconds: validMediaItem.lengthMilliseconds + 500,
    },
});

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...(inconsistentContextTypeTestCases as unknown as ResourceModelContextStateValidatorInvalidTestCase[]),
    {
        description: 'the time range context targets an end point that is too big',
        resource: validMediaItem,
        context: invalidTimeRangeContext,
        expectedError: new InconsistentTimeRangeError(
            invalidTimeRangeContext.timeRange,
            validMediaItem
        ),
    },
];

export default (): ContextStateValidatorTestCase => ({
    validCases,
    invalidCases,
});
