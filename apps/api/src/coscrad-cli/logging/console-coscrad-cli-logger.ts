import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Injectable } from '@nestjs/common';
import { ICoscradLogger } from './coscrad-logger.interface';

export interface CoscradLoggerOptions {
    isEnabled: boolean;
}

@Injectable()
export class ConsoleCoscradCliLogger implements ICoscradLogger {
    private isEnabled = false;

    constructor(options?: CoscradLoggerOptions) {
        if (isNonEmptyObject(options) && options.isEnabled === true) {
            this.isEnabled = true;
        } // else leave default value of false
    }

    log(message: string) {
        if (!this.isEnabled) {
            return;
        }

        console.log(message);
    }
}
