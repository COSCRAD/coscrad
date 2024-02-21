import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Video } from '../../../audio-visual/audio-item/entities/video.entity';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { TranslateVideoName } from './translate-video-name.command';
import { VideoNameTranslated } from './video-name-translated.event';

@CommandHandler(TranslateVideoName)
export class TranslateVideoNameCommandHandler extends BaseUpdateCommandHandler<Video> {
    protected async fetchRequiredExternalState(_: TranslateVideoName): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Video
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        video: Video,
        { text, languageCode }: TranslateVideoName
    ): ResultOrError<Video> {
        return video.translateName(text, languageCode);
    }

    protected buildEvent(command: TranslateVideoName, eventMeta: EventRecordMetadata): BaseEvent {
        return new VideoNameTranslated(command, eventMeta);
    }
}
