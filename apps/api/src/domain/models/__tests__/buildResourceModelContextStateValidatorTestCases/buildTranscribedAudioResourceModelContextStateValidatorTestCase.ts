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

const validCases = buildAllValidTestCasesForResource(ResourceType.transcribedAudio);

const validAudioStartPoint = 100;

const validTranscribedAudio = validCases[0].resource.clone({
    startMilliseconds: validAudioStartPoint,
});

const timeRangeWithInvalidOutPoint: TimeRangeWithoutData = {
    inPoint: validAudioStartPoint,
    outPoint: validTranscribedAudio.getEndMilliseconds() + 200,
};

const timeRangeWithInvalidInPoint: TimeRangeWithoutData = {
    inPoint: validAudioStartPoint - 10,
    outPoint: validTranscribedAudio.getEndMilliseconds(),
};

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(ResourceType.transcribedAudio),
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
