import { Module } from '@nestjs/common';
import { DynamicDataTypeModule } from '../../../validation';
import { CoscradEventFactory } from './coscrad-event-factory';
import { CoscradEventUnion } from './coscrad-event-union';

// TODO Should this be it's own lib or maybe part of the commands (CQRS now?) lib?
@Module({
    imports: [DynamicDataTypeModule],
    providers: [
        CoscradEventFactory,
        {
            provide: CoscradEventUnion,
            useValue: CoscradEventUnion,
        },
    ],
    exports: [CoscradEventFactory],
})
export class EventModule {}
