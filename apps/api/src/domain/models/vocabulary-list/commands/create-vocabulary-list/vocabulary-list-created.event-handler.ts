import { ICoscradEventHandler } from '../../../../../domain/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { VocabularyListCreated } from './vocabulary-list-created.event';

export class VocabularyListCreatedEventHandler implements ICoscradEventHandler {
    async handle(_event: VocabularyListCreated): Promise<void> {
        throw new InternalError(`VocabularyListCreatedEventHandler.handle not implemented`);
    }
}
