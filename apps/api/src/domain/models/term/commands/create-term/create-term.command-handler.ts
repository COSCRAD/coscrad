import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Term } from '../../entities/term.entity';
import { CreateTerm } from './create-term.command';
import { TermCreated } from './term-created.event';

@CommandHandler(CreateTerm)
export class CreateTermCommandHandler extends BaseCreateCommandHandler<Term> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Term>;

    protected aggregateType: AggregateType = AggregateType.term;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<Term>(
            ResourceType.term
        );
    }

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

    protected buildEvent(command: ICommand, eventId: string, userId: string): BaseEvent {
        return new TermCreated(command, eventId, userId);
    }
}
