import { CommandHandlerService, CommandMetadataBase } from '@coscrad/commands';
import { getCoscradDataSchema } from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';

export type CommandInfo = CommandMetadataBase & {
    label: string;
    description: string;
    schema: Record<string, unknown>;
};

@Injectable()
export class CommandInfoService {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    getCommandInfo(): CommandInfo[] {
        const allCommandsAndMeta = this.commandHandlerService.getAllCommandCtorsAndMetadata();

        return allCommandsAndMeta.map(({ constructor: ctor, meta }) => ({
            ...meta,
            schema: getCoscradDataSchema(ctor),
        })) as CommandInfo[];
    }
}
