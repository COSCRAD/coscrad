import { Type } from '@nestjs/common';
import { COMMAND_METADATA } from '../../decorators/constants';
import { CommandMetadataBase } from '../../decorators/types/CommandMetadataBase';
import { EmptyCommandTypeException } from '../../exceptions/empty-command-type-exception';
import { MetadataNotFoundException } from '../../exceptions/metadata-not-found-exception';
import { ICommand } from '../../interfaces';

export default <TCommandMeta extends CommandMetadataBase>(
    targetCommand: Type<ICommand>
): TCommandMeta => {
    const meta = Reflect.getMetadata(COMMAND_METADATA, targetCommand) as CommandMetadataBase;

    if (meta === null || typeof meta === 'undefined') {
        throw new MetadataNotFoundException(targetCommand);
    }

    if (!meta.type) {
        throw new EmptyCommandTypeException();
    }

    return meta as TCommandMeta;
};
