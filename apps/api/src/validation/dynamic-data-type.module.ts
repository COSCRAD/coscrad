import { Module } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';

@Module({
    imports: [DiscoveryModule],
    providers: [DiscoveryService, DynamicDataTypeFinderService],
    exports: [DynamicDataTypeFinderService],
})
export class DynamicDataTypeModule {}
