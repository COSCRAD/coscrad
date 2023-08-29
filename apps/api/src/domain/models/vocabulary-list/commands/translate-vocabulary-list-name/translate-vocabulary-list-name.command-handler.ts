import { CommandHandler, ICommand } from '@coscrad/commands';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../domain/common/entities/multilingual-text';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { TranslateVocabularyListName } from './translate-vocabulary-list-name.command';
import { VocabularyListNameTranslated } from './vocabulary-list-name-translated.event';

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
        { text, languageCode }: TranslateVocabularyListName
    ): ResultOrError<VocabularyList> {
        return VocabularyList.translateName(
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }

    protected buildEvent(command: ICommand, eventId: string, userId: string): BaseEvent {
        return new VocabularyListNameTranslated(command, eventId, userId);
    }
}
