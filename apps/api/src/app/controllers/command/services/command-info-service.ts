import { FormFieldType, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { CommandHandlerService, CommandMetadataBase } from '@coscrad/commands';
import { ClassSchema, getCoscradDataSchema } from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';
import { isNullOrUndefined } from '../../../../domain/utilities/validation/is-null-or-undefined';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { buildCommandForm } from '../../../../view-models/dynamicForms';
import { INDEX_SCOPED_COMMANDS } from '../command-info/constants';

type CommandTypeFilter = (commandType: string) => boolean;

const buildCommandTypeFilter = (
    context?: DomainModelCtor | CommandWriteContext
): CommandTypeFilter => {
    if (isNullOrUndefined(context)) return (_: string) => true;

    if (isCommandWriteContext(context))
        return (commandType: string) => context.getAvailableCommands().includes(commandType);

    return (commandType: string) =>
        // DO NOT DEFAULT TO [] here. Failing to decorate the Resource class should break things!
        Reflect.getMetadata(INDEX_SCOPED_COMMANDS, context).includes(commandType);
};

type CommandInfo = CommandMetadataBase & {
    label: string;
    description: string;
    schema: ClassSchema;
};

interface CommandWriteContext {
    getAvailableCommands(): string[];
}

const isCommandWriteContext = (input: unknown): input is CommandWriteContext =>
    typeof (input as CommandWriteContext).getAvailableCommands === 'function';

@Injectable()
export class CommandInfoService {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    // TODO Unit test the filtering logic
    getCommandInfo(): ICommandFormAndLabels[];
    getCommandInfo(context: DomainModelCtor): ICommandFormAndLabels[];
    getCommandInfo(context: CommandWriteContext): ICommandFormAndLabels[];
    getCommandInfo(context?: DomainModelCtor | CommandWriteContext): ICommandFormAndLabels[] {
        const commandTypeFilter = buildCommandTypeFilter(context);

        const allCommandsAndMeta = this.commandHandlerService.getAllCommandCtorsAndMetadata();

        const allCommandInfo = allCommandsAndMeta.map(({ constructor: ctor, meta }) => ({
            ...meta,
            schema: getCoscradDataSchema(ctor),
        })) as CommandInfo[];

        return allCommandInfo
            .filter(({ type }) => commandTypeFilter(type))
            .map(({ label, description, schema, type }) => ({
                label,
                description,
                // TODO use typeguard
                type: type as FormFieldType,
                form: buildCommandForm(type, schema),
            }));
    }
}
