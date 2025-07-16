import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { LiteralTranslationOfTermProvided } from './literal-translation-of-term-provided.event';
import { ProvideLiteralTranslationOfTerm } from './provide-literal-translation-of-term.command';

@CommandHandler(ProvideLiteralTranslationOfTerm)
export class ProvideLiteralTranslationOfTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected fetchRequiredExternalState(
        _command?: ProvideLiteralTranslationOfTerm
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        instance: Term,
        { literalTranslation, translationLanguageCode }: ProvideLiteralTranslationOfTerm
    ): ResultOrError<Term> {
        return instance.provideLiteralTranslation(literalTranslation, translationLanguageCode);
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Term
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(
        payload: ProvideLiteralTranslationOfTerm,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return LiteralTranslationOfTermProvided.fromProvideLiteralTranslationOfTermCommand(
            payload,
            eventMeta
        );
    }
}
