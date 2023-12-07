import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Resource } from '../../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { ITranscribable } from '../../../entities/transcribable.mixin';
import { ImportTranslationsForTranscript } from './import-translations-for-transcript.command';
import { TranslationsImportedForTranscript } from './translations-imported-for-transcript.event';

type TranscribableResource = ITranscribable & Resource;
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
