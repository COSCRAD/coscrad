import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EdgeConnection } from '../../edge-connection.entity';
import { CreateNoteAboutResource } from './create-note-about-resource.command';

@CommandHandler(CreateNoteAboutResource)
export class CreateNoteAboutResourceCommandHandler extends BaseCreateCommandHandler<EdgeConnection> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<EdgeConnection>;
    protected aggregateType: AggregateType;
    protected createNewInstance(_command: CreateNoteAboutResource): ResultOrError<EdgeConnection> {
        throw new Error('Method not implemented.');
    }
    protected fetchRequiredExternalState(
        _command?: CreateNoteAboutResource
    ): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }
    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: EdgeConnection
    ): InternalError | Valid {
        throw new Error('Method not implemented.');
    }
    protected buildEvent(
        _command: CreateNoteAboutResource,
        _eventId: string,
        _userId: string
    ): BaseEvent {
        throw new Error('Method not implemented.');
    }
}
