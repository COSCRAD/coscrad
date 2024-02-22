import { InternalError } from '../../../../../lib/errors/InternalError';

export class EmptyTranslationForTranscriptItem extends InternalError {
    constructor() {
        const msg = `Encountered empty (or whitespace only) text for a transcript item's translation`;

        super(msg);
    }
}
