import { Ack } from '../constants';
import { ICommand } from './command.interface';

export interface ICommandHandler {
    execute(
        command: ICommand,
        commandType: string,
        /**
         * This property allows the client to pass through additional
         * metadata (e.g. user ID).
         *
         * TODO [design] Should we make persisting events part of this
         * lib?
         */
        meta?: Record<string, unknown>
    ): Promise<Ack | Error>;
}
