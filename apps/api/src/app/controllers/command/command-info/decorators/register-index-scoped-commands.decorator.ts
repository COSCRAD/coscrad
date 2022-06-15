import { INDEX_SCOPED_COMMANDS } from '../constants';

export function RegisterIndexScopedCommands(commandIds: string[]): ClassDecorator {
    return (target: Object) => {
        /**
         * TODO Validate the commandIds are legit and not just random strings
         * TODO Restrict target to be for a registered Aggregate class
         */
        Reflect.defineMetadata(INDEX_SCOPED_COMMANDS, commandIds, target);
    };
}
