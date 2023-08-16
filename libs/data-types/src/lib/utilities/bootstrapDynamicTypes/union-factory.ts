import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Ctor } from '../getCoscradDataSchemaFromPrototype';
import { buildUnionTypesMap } from './buildUnionTypesMap';

export interface Builder<T = unknown, U = unknown> {
    build(input: T): U;
}

export class UnionFactory<T = unknown, UProduct = unknown> {
    // this assumes a string determinant
    private readonly unionMemberMap: Map<string, Ctor<T>>;

    private readonly discriminantPath: string;

    constructor(allCtorCandidates: Ctor<T>[], unionName: string) {
        const unionMap = buildUnionTypesMap<T>(allCtorCandidates);

        if (!unionMap.has(unionName)) {
            throw new Error(`Failed to create factory for unknown union: ${unionName}`);
        }

        const { discriminantPath, membersMap } = unionMap.get(unionName);

        this.unionMemberMap = membersMap;

        this.discriminantPath = discriminantPath;
    }

    build(input: unknown): UProduct {
        if (isNullOrUndefined(input)) {
            throw new Error(
                `UnionFactory.build requires a DTO with a string value at the discriminant path: ${this.discriminantPath}`
            );
        }

        const discriminantValue = input[this.discriminantPath] as string;

        const UnionMemberCtor = this.unionMemberMap.get(discriminantValue);

        if (!UnionMemberCtor) {
            throw new Error(
                `Failed to find a constructor for union member with discriminant [${this.discriminantPath}]: ${discriminantValue} `
            );
        }

        return new UnionMemberCtor(input) as unknown as UProduct;
    }
}
