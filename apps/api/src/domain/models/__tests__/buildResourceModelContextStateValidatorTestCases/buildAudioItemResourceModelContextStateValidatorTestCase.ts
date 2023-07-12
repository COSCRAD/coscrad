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

const validCases = buildAllValidTestCasesForResource(ResourceType.audioItem);

const validTranscribedAudio = validCases[0].resource.clone({
    lengthMilliseconds: 0,
});

const timeRangeWithInvalidOutPoint: TimeRangeWithoutData = {
    inPointMilliseconds: 0,
    outPointMilliseconds: validTranscribedAudio.length() + 200,
};

const timeRangeWithInvalidInPoint: TimeRangeWithoutData = {
    inPointMilliseconds: -10,
    outPointMilliseconds: validTranscribedAudio.length(),
};

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(ResourceType.audioItem),
    {
        description: `the out point of the time range context is too big`,
        resource: validTranscribedAudio,
        context: new TimeRangeContext({
            type: EdgeConnectionContextType.timeRange,
            timeRange: timeRangeWithInvalidOutPoint,
        }),
        expectedError: new InconsistentTimeRangeError(
            timeRangeWithInvalidOutPoint,
            validTranscribedAudio
        ),
    },
    {
        description: `The in point of the time range context is too small`,
        resource: validTranscribedAudio,
        context: new TimeRangeContext({
            type: EdgeConnectionContextType.timeRange,
            timeRange: timeRangeWithInvalidInPoint,
        }),
        expectedError: new InconsistentTimeRangeError(
            timeRangeWithInvalidInPoint,
            validTranscribedAudio
        ),
    },
];

export default () => ({
    validCases,
    invalidCases,
});
