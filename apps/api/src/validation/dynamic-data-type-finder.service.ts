import { bootstrapDynamicTypes } from '@coscrad/data-types';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { Ctor } from '../lib/types/Ctor';

const isClass = (input): input is Ctor<unknown> => {
    return typeof input === 'function' && /^\s*class\s+/.test(input.toString());
};

@Injectable()
export class DynamicDataTypeFinderService {
    constructor(private readonly discoverService: DiscoveryService) {}

    async bootstrapDynamicTypes() {
        const unionProviders = await this.findCtorsForUnions();

        bootstrapDynamicTypes(unionProviders);
    }

    private async findCtorsForUnions() {
        const dataTypeProviders = await this.discoverService.providers(
            (provider) => !provider.injectType && isClass(provider.instance)
        );

        return dataTypeProviders.map((provider) => provider.instance);
    }
}
