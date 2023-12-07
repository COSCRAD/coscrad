import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { TermTranslated } from './term-translated.event';
import { TranslateTerm } from './translate-term.command';

@CommandHandler(TranslateTerm)
export class TranslateTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected fetchRequiredExternalState(_command?: TranslateTerm): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        term: Term,
        { translation, languageCode }: TranslateTerm
    ): ResultOrError<Term> {
        return term.translate(translation, languageCode);
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Term
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(command: TranslateTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new TermTranslated(command, eventMeta);
    }
}
