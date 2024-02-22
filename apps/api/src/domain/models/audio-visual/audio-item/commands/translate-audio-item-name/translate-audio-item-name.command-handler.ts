import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../entities/audio-item.entity';
import { AudioItemNameTranslated } from './audio-item-name-translated-event';
import { TranslateAudioItemName } from './translate-audio-item-name.command';

@CommandHandler(TranslateAudioItemName)
export class TranslateAudioItemNameCommandHandler extends BaseUpdateCommandHandler<AudioItem> {
    protected async fetchRequiredExternalState(
        _: TranslateAudioItemName
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: AudioItem
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        audioItem: AudioItem,
        { text, languageCode }: TranslateAudioItemName
    ): ResultOrError<AudioItem> {
        return audioItem.translateName(text, languageCode);
    }

    protected buildEvent(
        command: TranslateAudioItemName,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new AudioItemNameTranslated(command, eventMeta);
    }
}
