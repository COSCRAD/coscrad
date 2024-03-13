import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent, IEventPayload } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { CoscradContributor } from '../../entities/coscrad-contributor.entity';
import { ContributorCreated } from './contributor-created.event';
import { CreateContributor } from './create-contributor.command';

@CommandHandler(CreateContributor)
export class CreateContributorCommandHandler extends BaseCreateCommandHandler<CoscradContributor> {
    protected createNewInstance(command: ICommandBase): ResultOrError<CoscradContributor> {
        throw new Error('Method not implemented.');
    }
    protected fetchRequiredExternalState(command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }
    protected validateExternalState(
        state: InMemorySnapshot,
        instance: CoscradContributor
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }
    protected buildEvent(
        payload: CreateContributor,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new ContributorCreated(payload, eventMeta);
    }
}
