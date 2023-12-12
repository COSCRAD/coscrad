import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Term } from '../../entities/term.entity';
import { CreateTerm } from './create-term.command';
import { TermCreated } from './term-created.event';

@CommandHandler(CreateTerm)
export class CreateTermCommandHandler extends BaseCreateCommandHandler<Term> {
    protected createNewInstance({
        text,
        aggregateCompositeIdentifier: { id },
        languageCode,
        contributorId,
    }: CreateTerm): ResultOrError<Term> {
        return new Term({
            type: AggregateType.term,
            id,
            text: buildMultilingualTextWithSingleItem(text, languageCode),
            contributorId,
            // You must run `PUBLISH_RESOURCE` to publish the term
            published: false,
            isPromptTerm: false,
        });
    }

    protected async fetchRequiredExternalState(_?: ICommand): Promise<InMemorySnapshot> {
        const allTerms = await this.repositoryProvider.forResource(AggregateType.term).fetchMany();

        return new DeluxeInMemoryStore({
            [AggregateType.term]: allTerms.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(state: InMemorySnapshot, term: Term): InternalError | Valid {
        /**
         * As it stands, we allow multiple terms with the same text.
         */
        return term.validateExternalState(state);
    }

    protected buildEvent(command: CreateTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new TermCreated(command, eventMeta);
    }
}
