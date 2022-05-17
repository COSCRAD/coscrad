import 'reflect-metadata';
import { ICommand } from '../ICommand';

const COMMAND_METADATA = '__command__';

const COMMAND_HANDLER_METADATA = '__commandHandler__';

export const CommandHandler =
    (command: ICommand): ClassDecorator =>
    (target: object) => {
        if (!Reflect.hasMetadata(COMMAND_METADATA, command)) {
            Reflect.defineMetadata(COMMAND_METADATA, { type: command.type }, command);
        }

        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
    };
