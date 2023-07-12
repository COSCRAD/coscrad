import InconsistentTimeRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { ResourceType } from '../../../types/ResourceType';
import {
    TimeRangeContext,
    TimeRangeWithoutData,
} from '../../context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.song);
const inconsistentContextTypeTestCases = buildAllInvalidTestCasesForResource(ResourceType.song);
const validSongStartingPoint = 100;
const validSong = validCases[0].resource.clone({
    startMilliseconds: validSongStartingPoint,
});

const timeRangeWithInvalidOutPoint: TimeRangeWithoutData = {
    inPointMilliseconds: validSongStartingPoint,
    outPointMilliseconds: validSong.getEndMilliseconds() + 5,
};

const timeRangeWithInvalidInPoint: TimeRangeWithoutData = {
    inPointMilliseconds: validSongStartingPoint - validSongStartingPoint / 2,
    outPointMilliseconds: validSong.getEndMilliseconds(),
};

export default () => ({
    validCases,
    invalidCases: [
        ...inconsistentContextTypeTestCases,
        {
            description: `the out point of the time range context is too big`,
            resource: validSong,
            context: new TimeRangeContext({
                type: EdgeConnectionContextType.timeRange,
                timeRange: timeRangeWithInvalidOutPoint,
            }),
            expectedError: new InconsistentTimeRangeError(timeRangeWithInvalidOutPoint, validSong),
        },
        {
            description: `The in point of the time range context is too small`,
            resource: validSong,
            context: new TimeRangeContext({
                type: EdgeConnectionContextType.timeRange,
                timeRange: timeRangeWithInvalidInPoint,
            }),
            expectedError: new InconsistentTimeRangeError(timeRangeWithInvalidInPoint, validSong),
        },
    ],
});
