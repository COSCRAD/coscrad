import { ICommandBase } from '@coscrad/api-interfaces';
import { ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { DigitalText } from '../../entities';

export class AddContentToDigitalTextPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }
    protected actOnInstance(
        _instance: DigitalText,
        _command: ICommand
    ): ResultOrError<DigitalText> {
        throw new Error('Method not implemented.');
    }
    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        throw new Error('Method not implemented.');
    }
    protected buildEvent(
        _command: ICommand,
        _eventId: string,
        _userId: string
    ): BaseEvent<ICommandBase> {
        throw new Error('Method not implemented.');
    }
}
