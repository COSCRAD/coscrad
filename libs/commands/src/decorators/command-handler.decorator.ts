import { Type } from '@nestjs/common';
import { ICommand } from '../interfaces/command.interface';
import { COMMAND_HANDLER_METADATA } from './constants';

/**
 * This decorator marks a class as a Command Handler.
 *
 * @param command command (constructor) that is handled by this command handler
 */
export const CommandHandler =
    (command: Type<ICommand>): ClassDecorator =>
    (target: object) => {
        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, { command }, target);
    };
