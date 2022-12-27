import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export default class TagLabelAlreadyInUseError extends InternalError {
    constructor(label: string, idOfExistingTag: AggregateId) {
        const message = `The tag ${label} is already in use by tag: ${idOfExistingTag}`;

        super(message);
    }
}
