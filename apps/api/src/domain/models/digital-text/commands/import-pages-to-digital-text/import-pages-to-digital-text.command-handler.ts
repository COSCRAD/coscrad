import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities';
import { ImportPagesToDigitalText } from './import-pages-to-digital-text.command';
import { PagesImportedToDigitalText } from './import-pages-to-digital-text.event';

@CommandHandler(ImportPagesToDigitalText)
export class ImportPagesToDigitalTextCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected actOnInstance(
        digitalText: DigitalText,
        { pages }: ImportPagesToDigitalText
    ): ResultOrError<DigitalText> {
        return digitalText.importPages(
            pages.map(({ pageIdentifier, content, photographId }) => ({
                pageIdentifier,
                audioAndTextContent: content,
                photographId,
            }))
        );
    }

    protected async fetchRequiredExternalState(
        _command?: ImportPagesToDigitalText
    ): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(
        payload: ImportPagesToDigitalText,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new PagesImportedToDigitalText(payload, eventMeta);
    }
}
