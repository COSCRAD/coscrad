import {
    bootstrapDynamicTypes as bootstrapDynamicTypesUtil,
    buildUnionTypesMap,
    UnionFactory,
} from '@coscrad/data-types';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { Ctor } from '../lib/types/Ctor';

const isClass = (input): input is Ctor<unknown> => {
    return typeof input === 'function' && /^\s*class\s+/.test(input.toString());
};

interface IUnionFactory<TDiscriminantValue = string, UProduct = unknown> {
    build(discriminantValue: TDiscriminantValue, ...args: unknown[]): UProduct;
}

@Injectable()
export class DynamicDataTypeFinderService {
    private unionNameToFactory: Map<string, IUnionFactory>;

    constructor(private readonly discoverService: DiscoveryService) {}

    async bootstrapDynamicTypes() {
        const unionProviders = await this.getAllDataClassCtors();

        bootstrapDynamicTypesUtil(unionProviders);

        if (!this.unionNameToFactory) {
            const dataClassCtors = (await this.getAllDataClassCtors()) as Ctor<unknown>[];

            const unionMap = buildUnionTypesMap(dataClassCtors);

            [...unionMap.keys()].forEach((unionName) =>
                this.unionNameToFactory.set(unionName, new UnionFactory(dataClassCtors, unionName))
            );
        }
    }

    public async getAllDataClassCtors() {
        const dataTypeProviders = await this.discoverService.providers(
            (provider) => !provider.injectType && isClass(provider.instance)
        );

        return dataTypeProviders.map((provider) => provider.instance);
    }

    public getUnionFactory<TDiscriminantValue = string, UProduct = unknown>(
        unionName: string
    ): IUnionFactory<TDiscriminantValue, UProduct> {
        if (!this.unionNameToFactory.has(unionName)) {
            throw new Error(`Failed to provide a union factory for unknown union: ${unionName}`);
        }

        return this.unionNameToFactory.get(unionName) as IUnionFactory<
            TDiscriminantValue,
            UProduct
        >;
    }
}
