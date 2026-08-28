import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';

@Module({
    imports: [DiscoveryModule],
    providers: [DynamicDataTypeFinderService],
    exports: [DynamicDataTypeFinderService],
})
export class DynamicDataTypeModule {}
