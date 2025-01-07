import {
    bootstrapDynamicTypes as bootstrapDynamicTypesUtil,
    UnionFactory,
} from '@coscrad/data-types';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { Ctor } from '../lib/types/Ctor';

const isClass = (input): input is Ctor<unknown> => {
    return typeof input === 'function' && /^\s*class\s+/.test(input.toString());
};

interface IUnionFactory<_T = unknown, UProduct = unknown> {
    build(discriminantValue: string, ...args: unknown[]): UProduct;
}

@Injectable()
export class DynamicDataTypeFinderService {
    public unionFactory: IUnionFactory;

    constructor(private readonly discoverService: DiscoveryService) {}

    async bootstrapDynamicTypes() {
        const unionProviders = await this.getAllDataClassCtors();

        bootstrapDynamicTypesUtil(unionProviders);

        if (!this.unionFactory) {
            const dataClassCtors = await this.getAllDataClassCtors();

            this.unionFactory = new UnionFactory(
                dataClassCtors as Ctor<unknown>[],
                // TODO This doesn't belong here...
                'COSCRAD_EVENT_UNION'
            );
        }
    }

    public async getAllDataClassCtors() {
        const dataTypeProviders = await this.discoverService.providers(
            (provider) => !provider.injectType && isClass(provider.instance)
        );

        return dataTypeProviders.map((provider) => provider.instance);
    }
}
