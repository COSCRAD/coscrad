import { TimeRangeWithoutData } from '../../domain/models/context/time-range-context/time-range-context.entity';
import formatTime from './formatTime';

export default ({
    inPointMilliseconds: inPoint,
    outPointMilliseconds: outPoint,
}: TimeRangeWithoutData) => `[${formatTime(inPoint)}, ${formatTime(outPoint)}]`;
