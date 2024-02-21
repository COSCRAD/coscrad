import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { TranscriptItem } from '../../../entities/transcript-item.entity';

export class InvalidTimestampOrderError extends InternalError {
    constructor({
        inPointMilliseconds,
        outPointMilliseconds,
    }: Pick<TranscriptItem, 'inPointMilliseconds' | 'outPointMilliseconds'>) {
        super(
            `Transcript item has invalid timestamp order: [${inPointMilliseconds},${outPointMilliseconds}]`
        );
    }
}
