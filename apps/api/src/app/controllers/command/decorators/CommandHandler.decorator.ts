import { Type } from '@nestjs/common';
import 'reflect-metadata';
import { ICommand } from '../ICommand';

export const COMMAND_METADATA = '__command__';

export const COMMAND_HANDLER_METADATA = '__commandHandler__';

export const CommandHandler =
    (command: Type<ICommand>): ClassDecorator =>
    (target: object) => {
        if (!Reflect.hasMetadata(COMMAND_METADATA, command)) {
            console.log(`decorating command: ${command}`);
            Reflect.defineMetadata(COMMAND_METADATA, { type: new command().type }, command);
        }

        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, { command }, target);
        console.log(`decorated command handler: ${target} for command: ${command}`);
    };
