import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { EntityType } from '../../types/entityTypes';

export default class TermHasNoTextInAnyLanguageError extends InternalError {
    constructor(entityType?: EntityType) {
        const message = [
            `A null or undefined DTO was provided`,
            entityType ? `for entity of type ${entityType}` : ``,
        ].join(' ');

        super(message);
    }
}
