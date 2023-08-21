import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { TranslateVocabularyListName } from './translate-vocabulary-list-name.command';

@CommandHandler(TranslateVocabularyListName)
export class TranslateVocabularyListNameCommandHandler extends BaseUpdateCommandHandler<VocabularyList> {
    protected async fetchRequiredExternalState(
        _: TranslateVocabularyListName
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: VocabularyList
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        VocabularyList: VocabularyList,
        command: TranslateVocabularyListName
    ): ResultOrError<VocabularyList> {
        return VocabularyList.translateName();
    }
}
