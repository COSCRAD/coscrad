import { DynamicModule, Module } from '@nestjs/common';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../validation';
import { CoscradEventFactory } from './coscrad-event-factory';
import { CoscradEventUnion } from './coscrad-event-union';

// TODO Should this be it's own lib or maybe part of the commands (CQRS now?) lib?
@Module({})
export class EventModule {
    static forRootAsync(): DynamicModule {
        return {
            module: EventModule,
            imports: [DynamicDataTypeModule],
            providers: [
                {
                    provide: CoscradEventFactory,
                    useFactory: (_dataTypeFinder: DynamicDataTypeFinderService) => {
                        // const allDataClassCtors = await dataTypeFinder.getAllDataClassCtors();

                        // return new CoscradEventFactory(allDataClassCtors as Ctor<unknown>[]);
                        return new CoscradEventFactory([]);
                    },
                    inject: [DynamicDataTypeFinderService],
                },
                {
                    provide: CoscradEventUnion,
                    useValue: CoscradEventUnion,
                },
            ],
            exports: [CoscradEventFactory],
        };
    }
}
