import { AggregateType, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { CommandHandlerService, CommandMetadataBase } from '@coscrad/commands';
import { ClassSchema, getCoscradDataSchema } from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';
import { AggregateId } from '../../../../domain/types/AggregateId';
import { isNullOrUndefined } from '../../../../domain/utilities/validation/is-null-or-undefined';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { buildCommandForm } from '../../../../queries/dynamicForms';
import { INDEX_SCOPED_COMMANDS } from '../command-info/constants';

type CommandTypeFilter = (commandType: string) => boolean;

const buildCommandTypeFilter = (
    context?: DomainModelCtor | DetailScopedCommandWriteContext | IndexScopedViewContext
): CommandTypeFilter => {
    if (isNullOrUndefined(context)) return (_: string) => true;

    if (isCommandWriteContext(context))
        return (commandType: string) => context.getAvailableCommands().includes(commandType);

    if (isCommandViewIndexContext(context))
        return (commandType: string) => context.getIndexScopedCommands().includes(commandType);

    return (commandType: string) =>
        // DO NOT DEFAULT TO [] here. Failing to decorate the Resource class should break things!
        Reflect.getMetadata(INDEX_SCOPED_COMMANDS, context).includes(commandType);
};

type CommandInfo = CommandMetadataBase & {
    label: string;
    description: string;
    schema: ClassSchema;
};

export type DetailScopedCommandWriteContext = {
    getAvailableCommands(): string[];

    getCompositeIdentifier(): {
        type: AggregateType;
        id: AggregateId;
    };
};

type IndexScopedCommandWriteContext = DomainModelCtor;

type IndexScopedViewContext = {
    getIndexScopedCommands(): string[];
};

export const isCommandViewIndexContext = (input: unknown): input is IndexScopedViewContext =>
    typeof (input as IndexScopedViewContext).getIndexScopedCommands === 'function';

export const isCommandWriteContext = (input: unknown): input is DetailScopedCommandWriteContext =>
    typeof (input as DetailScopedCommandWriteContext).getAvailableCommands === 'function';

export type CommandContext =
    | IndexScopedCommandWriteContext
    | DetailScopedCommandWriteContext
    | IndexScopedViewContext;

@Injectable()
export class CommandInfoService {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    getCommandSchemasWithMetadata(): CommandInfo[] {
        return this.commandHandlerService
            .getAllCommandCtorsAndMetadata()
            .map(({ constructor: ctor, meta }) => ({
                ...meta,
                schema: getCoscradDataSchema(ctor),
            })) as CommandInfo[];
    }

    // TODO Unit test the filtering logic
    getCommandForms(): ICommandFormAndLabels[];
    getCommandForms(context: DomainModelCtor): ICommandFormAndLabels[];
    // note that we are moving towards this override
    getCommandForms(context: IndexScopedViewContext): ICommandFormAndLabels[];
    getCommandForms(context: DetailScopedCommandWriteContext): ICommandFormAndLabels[];
    getCommandForms(context: CommandContext): ICommandFormAndLabels[];
    getCommandForms(context?: CommandContext): ICommandFormAndLabels[] {
        const commandTypeFilter = buildCommandTypeFilter(context);

        return this.getCommandSchemasWithMetadata()
            .filter(({ type }) => commandTypeFilter(type))
            .map(({ label, description, schema, type }) => ({
                label,
                description,
                type,
                form: buildCommandForm(schema, context),
            }));
    }
}
