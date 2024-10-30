import { Injectable } from '@nestjs/common';
import { ICoscradLogger } from './coscrad-logger.interface';

export interface CoscradLoggerOptions {
    isEnabled: boolean;
}

@Injectable()
export class ConsoleCoscradCliLogger implements ICoscradLogger {
    log(message: string) {
        return;
    }
}
