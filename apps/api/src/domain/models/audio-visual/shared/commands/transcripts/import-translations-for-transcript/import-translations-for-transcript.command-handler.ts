import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { ImportTranslationsForTranscript } from './import-translations-for-transcript.command';
import { TranslationsImportedForTranscript } from './translations-imported-for-transcript.event';

type TranscribableResource = AudioItem | Video;
@CommandHandler(ImportTranslationsForTranscript)
export class ImportTranslationsForTranscriptCommandHandler extends BaseUpdateCommandHandler<TranscribableResource> {
    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: TranscribableResource
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        instance: TranscribableResource,
        { translationItems }: ImportTranslationsForTranscript
    ): ResultOrError<TranscribableResource> {
        return instance.importTranslationsForTranscript(
            translationItems.map(({ inPointMilliseconds, translation: text, languageCode }) => ({
                inPointMilliseconds,
                text,
                languageCode,
            }))
        ) as ResultOrError<TranscribableResource>;
    }

    protected buildEvent(
        command: ImportTranslationsForTranscript,
        eventMeta: EventRecordMetadata
    ): BaseEvent<ICommandBase> {
        return new TranslationsImportedForTranscript(command, eventMeta);
    }
}
