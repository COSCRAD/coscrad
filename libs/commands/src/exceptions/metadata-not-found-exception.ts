import { Type } from '@nestjs/common';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';

export class MetadataNotFoundException extends Error {
    constructor(target: Type<ICommandHandler> | Type<ICommand>) {
        super(`Failed to find metadata for target: ${target.name}`);
    }
}
