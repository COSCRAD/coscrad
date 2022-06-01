import { Type } from '@nestjs/common';
import { COMMAND_HANDLER_METADATA } from '../../decorators/constants';
import { CommandHandlerMetadata } from '../../decorators/types/CommandHandlerMetadata';
import { MetadataNotFoundException } from '../../exceptions/metadata-not-found-exception';
import { ICommandHandler } from '../../interfaces/command-handler.interface';
import { ICommand } from '../../interfaces/command.interface';

export default (targetCommandHandler: Type<ICommandHandler>): Type<ICommand> => {
    const meta = Reflect.getMetadata(
        COMMAND_HANDLER_METADATA,
        targetCommandHandler
    ) as CommandHandlerMetadata;

    if (meta === null || typeof meta === 'undefined') {
        throw new MetadataNotFoundException(targetCommandHandler);
    }

    const { command } = meta;

    return command;
};
