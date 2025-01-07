import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';

@Module({
    imports: [DiscoveryModule],
    providers: [DynamicDataTypeFinderService],
    exports: [DynamicDataTypeFinderService],
})
export class DynamicDataTypeModule {}
