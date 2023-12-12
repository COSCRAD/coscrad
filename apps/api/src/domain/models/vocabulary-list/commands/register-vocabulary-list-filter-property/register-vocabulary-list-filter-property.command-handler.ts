import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { DropboxOrCheckbox } from '../../types/dropbox-or-checkbox';
import {
    FilterPropertyType,
    RegisterVocabularyListFilterProperty,
} from './register-vocabulary-list-filter-property.command';
import { VocabularyListFilterPropertyRegistered } from './vocabulary-list-filter-property-registered';

@CommandHandler(RegisterVocabularyListFilterProperty)
export class RegisterVocabularyListFilterPropertyCommandHandler extends BaseUpdateCommandHandler<VocabularyList> {
    protected async fetchRequiredExternalState(
        _: RegisterVocabularyListFilterProperty
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
        instance: VocabularyList,
        { name, type, allowedValuesAndLabels }: RegisterVocabularyListFilterProperty
    ): ResultOrError<VocabularyList> {
        /**
         * This is necessary until a migration \ event versioning occurs so we can
         * rename the properties on existing data.
         */
        const mappedType =
            type === FilterPropertyType.selection
                ? DropboxOrCheckbox.dropbox
                : DropboxOrCheckbox.checkbox;

        return instance.registerFilterProperty(name, mappedType, allowedValuesAndLabels);
    }

    protected buildEvent(
        command: RegisterVocabularyListFilterProperty,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new VocabularyListFilterPropertyRegistered(command, eventMeta);
    }
}
