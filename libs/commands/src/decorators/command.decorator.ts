import { EmptyCommandTypeException } from '../exceptions/empty-command-type-exception';
import { COMMAND_METADATA } from './constants';

/**
 * This decorator marks a class as a Command.
 *
 * @param type name of the command (e.g. 'ADD_WIDGET')
 */
export const Command =
    (type: string): ClassDecorator =>
    (target: object) => {
        if (type.length === 0) {
            throw new EmptyCommandTypeException();
        }

        Reflect.defineMetadata(COMMAND_METADATA, { type }, target);
    };
