import { Type } from '@nestjs/common';
import { ICommand } from '../../interfaces/command.interface';
import getCommandMetadata from './getCommandMetadata';

export default (targetCommand: Type<ICommand>): string => {
    const { type } = getCommandMetadata(targetCommand);

    return type;
};
