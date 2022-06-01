import { Type } from '@nestjs/common';
import { ICommand } from '../../interfaces/command.interface';

export type CommandHandlerMetadata = {
    command: Type<ICommand>;
};
