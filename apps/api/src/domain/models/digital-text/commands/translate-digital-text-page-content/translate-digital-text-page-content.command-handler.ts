import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities';
import { DigitalTextPageContentTranslated } from './digital-text-page-content-translated.event';
import { TranslateDigitalTextPageContent } from './translate-digital-text-page-content.command';

@CommandHandler(TranslateDigitalTextPageContent)
export class TranslateDigitalTextPageContentCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected fetchRequiredExternalState(
        _: TranslateDigitalTextPageContent
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        DigitalText: DigitalText,
        {
            languageCode,
            translation,
            pageIdentifier: pageIdentifer,
        }: TranslateDigitalTextPageContent
    ): ResultOrError<DigitalText> {
        return DigitalText.translatePageContent(pageIdentifer, translation, languageCode);
    }

    protected buildEvent(
        command: TranslateDigitalTextPageContent,
        meta: EventRecordMetadata
    ): BaseEvent<ICommandBase> {
        return new DigitalTextPageContentTranslated(command, meta);
    }
}
