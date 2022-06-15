import { CommandHandlerService, CommandMetadataBase } from '@coscrad/commands';
import { getCoscradDataSchema } from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';
import { isNullOrUndefined } from '../../../../domain/utilities/validation/is-null-or-undefined';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { INDEX_SCOPED_COMMANDS } from '../command-info/constants';

type CommandTypeFilter = (commandType: string) => boolean;

const buildCommandTypeFilter = (
    context?: DomainModelCtor | CommandWriteContext
): CommandTypeFilter => {
    if (isNullOrUndefined(context)) return (_: string) => true;

    if (isCommandWriteContext(context))
        return (commandType: string) => context.getAvailableCommands().includes(commandType);

    return (commandType: string) =>
        Reflect.getMetadata(INDEX_SCOPED_COMMANDS, context).includes(commandType);
};

export type CommandInfo = CommandMetadataBase & {
    label: string;
    description: string;
    schema: Record<string, unknown>;
};

export interface CommandWriteContext {
    getAvailableCommands(): string[];
}

const isCommandWriteContext = (input: unknown): input is CommandWriteContext =>
    typeof (input as CommandWriteContext).getAvailableCommands === 'function';

@Injectable()
export class CommandInfoService {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    // TODO Unit test the filtering logic
    getCommandInfo(): CommandInfo[];
    getCommandInfo(context: DomainModelCtor): CommandInfo[];
    getCommandInfo(context: CommandWriteContext): CommandInfo[];
    getCommandInfo(context?: DomainModelCtor | CommandWriteContext): CommandInfo[] {
        const commandTypeFilter = buildCommandTypeFilter(context);

        const allCommandsAndMeta = this.commandHandlerService.getAllCommandCtorsAndMetadata();

        const allCommandInfo = allCommandsAndMeta.map(({ constructor: ctor, meta }) => ({
            ...meta,
            schema: getCoscradDataSchema(ctor),
        })) as CommandInfo[];

        return allCommandInfo.filter(({ type }) => commandTypeFilter(type));
    }
}
