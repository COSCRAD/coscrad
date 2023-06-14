import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EdgeConnection } from '../../edge-connection.entity';
import { ConnectResourcesWithNote } from './connect-resources-with-note.command';

@CommandHandler(ConnectResourcesWithNote)
export class ConnectResourcesWithNoteCommandHandler extends BaseCreateCommandHandler<EdgeConnection> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<EdgeConnection>;

    protected aggregateType: AggregateType = AggregateType.note;

    protected createNewInstance(_command: ICommandBase): ResultOrError<EdgeConnection> {
        // TODO wrap factory in base create command handler when refactor this one!
        throw new Error(`method not implemented.`);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: EdgeConnection
    ): InternalError | Valid {
        throw new Error('Method not implemented.');
    }

    protected buildEvent(_command: ICommand, _eventId: string, _userId: string): BaseEvent {
        throw new Error('Method not implemented.');
    }
}
