import { Module } from '@nestjs/common';
import { Ctor } from '../../../lib/types/Ctor';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../validation';
import { CoscradEventFactory } from './coscrad-event-factory';

@Module({
    imports: [DynamicDataTypeModule],
    providers: [
        {
            provide: CoscradEventFactory,
            useFactory: async (dynamicDataTypeFinderService: DynamicDataTypeFinderService) => {
                const allCtors = await dynamicDataTypeFinderService.getAllDataClassCtors();

                return new CoscradEventFactory(allCtors as Ctor<unknown>[]);
            },
            inject: [DynamicDataTypeFinderService],
        },
    ],
})
export class CoscradEventModule {}
