import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { EMPTY_DTO_INJECTION_TOKEN } from '../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';

const EmptyDtoProvider = {
    provide: EMPTY_DTO_INJECTION_TOKEN,
    useValue: null,
};

@Module({
    imports: [DiscoveryModule],
    providers: [DynamicDataTypeFinderService, EmptyDtoProvider],
    exports: [DynamicDataTypeFinderService, EmptyDtoProvider],
})
export class DynamicDataTypeModule implements OnApplicationBootstrap {
    constructor(private readonly dataTypeFinderService: DynamicDataTypeFinderService) {}

    async onApplicationBootstrap() {
        /**
         * This is necessary to ensure that all the union member schemas are
         * available on `UnionPropertyType` definitions so that we can validate
         * instances of classes that leverage the dynamic union COSCRAD data types.
         */
        await this.dataTypeFinderService.bootstrapDynamicTypes();
    }
}
