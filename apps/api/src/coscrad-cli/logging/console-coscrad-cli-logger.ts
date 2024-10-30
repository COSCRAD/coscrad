import { Injectable } from '@nestjs/common';
import { ICoscradLogger } from './coscrad-logger.interface';

export interface CoscradLoggerOptions {
    isEnabled: boolean;
}

@Injectable()
export class ConsoleCoscradCliLogger implements ICoscradLogger {
    private isEnabled = false;

    constructor({ isEnabled }: CoscradLoggerOptions = { isEnabled: false }) {
        this.isEnabled = isEnabled;
    }

    log(message: string) {
        if (!this.isEnabled) {
            return;
        }

        console.log(message);
    }
}
