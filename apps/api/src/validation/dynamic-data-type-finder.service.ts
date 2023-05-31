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

    async registerAllUnions() {
        const unionProviders = await this.findCtorsForUnions();

        bootstrapDynamicTypes(unionProviders);
    }

    private async findCtorsForUnions() {
        const allProviders = await this.discoverService.providers(
            (provider) => !!provider.injectType
        );

        const unionProviders = allProviders.map((provider) => provider.injectType).filter(isClass);
        // .map((c) => c.constructor);

        return unionProviders;
    }
}
