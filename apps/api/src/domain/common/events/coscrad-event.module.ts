import { Module } from '@nestjs/common';
import { DynamicDataTypeModule } from '../../../validation';
import { CoscradEventFactory } from './coscrad-event-factory';

/**
 * This appears to be unused.
 */
@Module({
    imports: [DynamicDataTypeModule],
    providers: [CoscradEventFactory],
})
export class CoscradEventModule {}
