import { Type } from '@nestjs/common';
import { COMMAND_METADATA } from '../../decorators/constants';
import { CommandMetadata } from '../../decorators/types/CommandMetadata';
import { MetadataNotFoundException } from '../../exceptions/metadata-not-found-exception';
import { ICommand } from '../../interfaces/command.interface';

export default (targetCommand: Type<ICommand>): string => {
    const meta = Reflect.getMetadata(COMMAND_METADATA, targetCommand) as CommandMetadata;

    if (meta === null || typeof meta === 'undefined') {
        throw new MetadataNotFoundException(targetCommand);
    }

    const { type } = meta;

    return type;
};
