import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { EMPTY_DTO_INJECTION_TOKEN } from '../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';

const EmptyDtoProvider = {
    provide: EMPTY_DTO_INJECTION_TOKEN,
    useValue: null,
};

@Module({
    imports: [DiscoveryModule],
    // Is EmptyDtoProvider still needed?
    providers: [DynamicDataTypeFinderService, EmptyDtoProvider],
    exports: [DynamicDataTypeFinderService, EmptyDtoProvider],
})
export class DynamicDataTypeModule {}
