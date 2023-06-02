import { bootstrapDynamicTypes, UnionTypesMap } from '@coscrad/data-types';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { InternalError } from '../lib/errors/InternalError';
import { Ctor } from '../lib/types/Ctor';

const isClass = (input): input is Ctor<unknown> => {
    return typeof input === 'function' && /^\s*class\s+/.test(input.toString());
};

@Injectable()
export class DynamicDataTypeFinderService {
    private unionMap: UnionTypesMap;

    constructor(private readonly discoverService: DiscoveryService) {}

    async registerAllUnions() {
        const unionProviders = await this.findCtorsForUnions();

        this.unionMap = bootstrapDynamicTypes(unionProviders);
    }

    validateUnion(_unionName: string, _input: unknown) {
        /**
         * // note we need to put the discriminant paths in union map
         * - {membersMap, discriminantPath} = get members map for this union
         *      - internal error thrown if not found
         * - discriminantValue = get value of discriminant for input
         *      - if none return invalid property error for discriminant property
         * - memberCtor = membersMap.get(discriminantValue)
         * - validate input against schema for memberCtor
         *
         * - can we recurse if we hit a union member that leverages another union?
         */

        throw new InternalError(`Not implemented`);
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
