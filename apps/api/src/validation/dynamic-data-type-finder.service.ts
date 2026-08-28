import {
    bootstrapDynamicTypes as bootstrapDynamicTypesUtil,
    UnionFactory,
} from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
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

            /**
             * What we really want to do here is to discover all union types
             * and eagerly create their factories, keeping them in a
             * lookup table.
             */
            this.unionFactory = new UnionFactory(
                dataClassCtors as Ctor<unknown>[],
                // TODO This doesn't belong here...
                'COSCRAD_EVENT_UNION'
            );
        }
    }

    public async getAllDataClassCtors() {
        const providers = this.discoverService.getProviders();

        const dataTypeProviders = providers.filter((instanceWrapper) =>
            isClass(instanceWrapper?.instance)
        );

        const allCtors = dataTypeProviders.map((provider) => provider.instance);

        return allCtors;
    }
}
