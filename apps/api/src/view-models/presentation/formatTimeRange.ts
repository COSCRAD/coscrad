import { TimeRangeWithoutData } from '../../domain/models/context/time-range-context/time-range-context.entity';
import formatTime from './formatTime';

export default ({ inPoint, outPoint }: TimeRangeWithoutData) =>
    `[${formatTime(inPoint)}, ${formatTime(outPoint)}]`;
