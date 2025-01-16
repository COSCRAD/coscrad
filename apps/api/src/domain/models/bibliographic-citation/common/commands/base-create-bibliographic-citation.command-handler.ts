import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../domain/common/events/interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { validAggregateOrThrow } from '../../../shared/functional';
import { IBibliographicCitationData } from '../../interfaces/bibliographic-citation-data.interface';
import { IBibliographicCitation } from '../../interfaces/bibliographic-citation.interface';

export abstract class BaseCreateBibliographicCitation extends BaseCreateCommandHandler<IBibliographicCitation> {
    protected aggregateType: ResourceType = AggregateType.bibliographicCitation;

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<
        IBibliographicCitation<IBibliographicCitationData>
    >;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource(
            this.aggregateType
        );
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource(this.aggregateType)
            .fetchMany();

        const preExistingBibliographicCitations = searchResult.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            [AggregateType.bibliographicCitation]: preExistingBibliographicCitations,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: IBibliographicCitation<IBibliographicCitationData>
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }
}
