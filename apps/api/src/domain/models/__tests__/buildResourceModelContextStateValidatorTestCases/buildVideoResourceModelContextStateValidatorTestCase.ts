import InconsistentTimeRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { ResourceType } from '../../../types/ResourceType';
import {
    TimeRangeContext,
    TimeRangeWithoutData,
} from '../../context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.video);

const validVideo = validCases[0].resource.clone({
    lengthMilliseconds: 250,
});

const timeRangeWithInvalidOutPoint: TimeRangeWithoutData = {
    inPoint: 0,
    outPoint: validVideo.length() + 100,
};

const timeRangeWithInvalidInPoint: TimeRangeWithoutData = {
    inPoint: -1200,
    outPoint: validVideo.length(),
};

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(ResourceType.video),
    {
        description: `the out point of the time range context is too big`,
        resource: validVideo,
        context: new TimeRangeContext({
            type: EdgeConnectionContextType.timeRange,
            timeRange: timeRangeWithInvalidOutPoint,
        }),
        expectedError: new InconsistentTimeRangeError(timeRangeWithInvalidOutPoint, validVideo),
    },
    {
        description: `The in point of the time range context is too small`,
        resource: validVideo,
        context: new TimeRangeContext({
            type: EdgeConnectionContextType.timeRange,
            timeRange: timeRangeWithInvalidInPoint,
        }),
        expectedError: new InconsistentTimeRangeError(timeRangeWithInvalidInPoint, validVideo),
    },
];

export default () => ({
    validCases,
    invalidCases,
});
