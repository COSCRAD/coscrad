import { Injectable } from '@nestjs/common';
import { ICoscradCliLogger } from './coscrad-cli-logger.interface';

@Injectable()
export class ConsoleCoscradCliLogger implements ICoscradCliLogger {
    log(message: string) {
        console.log(message);
    }
}
