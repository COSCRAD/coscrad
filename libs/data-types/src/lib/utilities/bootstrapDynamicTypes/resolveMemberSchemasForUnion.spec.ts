import { ThingDataOne, ThingDataTwo, Widget } from '../../../test/widget';
import {
    NestedDataType,
    NonNegativeFiniteNumber,
    Union,
    UnionMember,
    UUID,
} from '../../decorators';
import {
    resolveMemberSchemasForUnion,
    UnionMemberSchemaDefinition,
} from './resolveMemberSchemasForUnion';

const assertMembersResolved = (
    schemaDefinitions: UnionMemberSchemaDefinition[],
    expectedNumberOfMembers: number,
    expectedDiscriminantValues: string[]
): void => {
    expect(schemaDefinitions.length).toBe(expectedNumberOfMembers);

    const missingMembers = expectedDiscriminantValues.filter(
        (discriminantValue) =>
            !schemaDefinitions.some(
                ({ discriminant: discriminantValueForThisSchema }) =>
                    discriminantValue === discriminantValueForThisSchema
            )
    );

    expect(missingMembers).toEqual([]);
};

describe(`resolveMemberSchemasForUnion`, () => {
    describe(`when there are multiple union members with no nesting`, () => {
        it(`should resolve the members`, () => {
            const result = resolveMemberSchemasForUnion(
                [Widget, ThingDataOne, ThingDataTwo],
                'THING_UNION'
            );

            assertMembersResolved(result, 2, ['one', 'two']);
        });
    });

    describe(`when one of the union members leverages a nested type`, () => {
        class Thing3Rating {
            @NonNegativeFiniteNumber({
                label: 'durability',
                description: 'numeric rating as to how durable this thing 3 is',
            })
            durability: number;
        }

        @UnionMember('THING_UNION', 'three')
        class ThingDataThree {
            type = 'three';

            name: string;

            @NestedDataType(Thing3Rating, {
                label: 'rating',
                description: 'performance attributes for this thing 3',
            })
            rating: Thing3Rating;
        }

        class ToolRoom {
            @UUID({
                description: 'location ID',
                label: 'location ID',
            })
            locationId: string;

            @Union('THING_UNION', 'type', {
                description: 'the machines in this tool room',
                label: 'machines',
            })
            machines: ThingDataOne | ThingDataTwo | ThingDataThree;
        }

        it('should resolve the members', () => {
            const result = resolveMemberSchemasForUnion(
                [Widget, ThingDataOne, ThingDataTwo, ThingDataThree, Thing3Rating, ToolRoom],
                'THING_UNION'
            );

            assertMembersResolved(result, 3, ['one', 'two', 'three']);
        });
    });

    describe(`when there is a nested type that does not leverage another union`, () => {
        it.todo('should have a test');
    });
});
