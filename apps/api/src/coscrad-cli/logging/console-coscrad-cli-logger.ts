import { Injectable } from '@nestjs/common';
import { ICoscradLogger } from './coscrad-logger.interface';

@Injectable()
export class ConsoleCoscradCliLogger implements ICoscradLogger {
    log(message: string) {
        console.log(message);
    }
}
