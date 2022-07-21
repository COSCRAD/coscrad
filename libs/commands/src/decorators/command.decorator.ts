import { EmptyCommandTypeException } from '../exceptions/empty-command-type-exception';
import { COMMAND_METADATA } from './constants';
import { CommandMetadataBase } from './types/CommandMetadataBase';

/**
 * This decorator marks a class as a Command.
 *
 * @param metadata an object that includes
 * - a `type` property - name of the command (e.g. 'ADD_WIDGET')
 * - any additional metadata (general commadn info) you need, pershaps to share
 * with the client through your API
 *
 */
export const Command =
    <TCommandMeta extends CommandMetadataBase>(metadata: TCommandMeta): ClassDecorator =>
    (target: object) => {
        const { type } = metadata;

        if (type.length === 0) {
            throw new EmptyCommandTypeException();
        }

        Reflect.defineMetadata(COMMAND_METADATA, metadata, target);
    };
