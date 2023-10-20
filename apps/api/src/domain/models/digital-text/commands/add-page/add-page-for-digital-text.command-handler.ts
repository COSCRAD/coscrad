import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { DigitalText } from '../../digital-text.entity';
import { AddPageForDigitalText } from './add-page-for-digital-text.command';
import { PageAddedForDigitalText } from './page-added-for-digital-text.event';

@CommandHandler(AddPageForDigitalText)
export class AddPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected readonly aggregateType: AggregateType = AggregateType.digitalText;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<DigitalText>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = repositoryProvider.forResource(
            ResourceType.digitalText
        );
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        digitalText: DigitalText,
        { pageIdentifier }: AddPageForDigitalText
    ): ResultOrError<DigitalText> {
        return digitalText.addPage(pageIdentifier);
    }

    protected buildEvent(
        command: AddPageForDigitalText,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new PageAddedForDigitalText(command, eventId, userId);
    }
}
