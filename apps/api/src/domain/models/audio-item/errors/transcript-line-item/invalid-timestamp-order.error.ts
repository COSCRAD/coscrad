import { InternalError } from '../../../../../lib/errors/InternalError';
import { TranscriptItem } from '../../entities/transcript-item.entity';

export class InvalidTimestampOrderError extends InternalError {
    constructor({ inPoint, outPoint }: Pick<TranscriptItem, 'inPoint' | 'outPoint'>) {
        super(`Transcript item has invalid timestamp order: [${inPoint},${outPoint}]`);
    }
}
