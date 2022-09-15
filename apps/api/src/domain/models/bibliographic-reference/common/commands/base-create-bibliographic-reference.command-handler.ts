import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../../persistence/repositories/repository.provider';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { validAggregateOrThrow } from '../../../shared/functional';
import { IBibliographicReferenceData } from '../../interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../interfaces/bibliographic-reference.interface';

export abstract class BaseCreateBibliographicReference extends BaseCreateCommandHandler<IBibliographicReference> {
    protected aggregateType: ResourceType = AggregateType.bibliographicReference;

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<
        IBibliographicReference<IBibliographicReferenceData>
    >;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource(
            this.aggregateType
        );
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource(this.aggregateType)
            .fetchMany();

        const preExistingBibliographicReferences = searchResult.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            bibliographicReference: preExistingBibliographicReferences,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: IBibliographicReference<IBibliographicReferenceData>
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }
}
