import { UNION_METADATA } from '@coscrad/data-types';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CreateNoteAboutResource } from '../domain/models/context/commands';
import { EMPTY_DTO_INJECTION_TOKEN } from '../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';

const EmptyDtoProvider = {
    provide: EMPTY_DTO_INJECTION_TOKEN,
    useValue: {},
};

@Module({
    imports: [DiscoveryModule],
    providers: [DynamicDataTypeFinderService, EmptyDtoProvider],
    exports: [DynamicDataTypeFinderService, EmptyDtoProvider],
})
export class DynamicDataTypeModule implements OnApplicationBootstrap {
    constructor(private readonly dataTypeFinderService: DynamicDataTypeFinderService) {}

    async onApplicationBootstrap() {
        await this.dataTypeFinderService.registerAllUnions();

        const meta = Reflect.getMetadata(UNION_METADATA, CreateNoteAboutResource);

        console.log({ commandMeta: meta });
    }
}
