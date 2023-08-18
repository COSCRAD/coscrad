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

    build(discriminantValue: string, ...args: unknown[]): UProduct {
        const UnionMemberCtor = this.unionMemberMap.get(discriminantValue);

        if (!UnionMemberCtor) {
            throw new Error(
                `Failed to find a constructor for union member with discriminant [${this.discriminantPath}]: ${discriminantValue} `
            );
        }

        return new UnionMemberCtor(...args) as unknown as UProduct;
    }
}
