import { InternalError } from '../../../../lib/errors/InternalError';

export class CannotReplaceTraditionalNameError extends InternalError {
    constructor(newTraditionalNameText: string, existingTraditionalNameText: string) {
        const msg = `You cannot add traditional name: ${newTraditionalNameText}, as there is already a traditional name: ${existingTraditionalNameText}`;

        super(msg);
    }
}
