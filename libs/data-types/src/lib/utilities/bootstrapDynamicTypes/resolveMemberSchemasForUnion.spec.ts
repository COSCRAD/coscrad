import { ThingDataOne, ThingDataTwo, Widget } from '../../../test/widget';
import {
    NestedDataType,
    NonNegativeFiniteNumber,
    Union,
    UnionMember,
    UUID,
} from '../../decorators';
import { UnionLeveragesAnotherException } from './exceptions';
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

    /**
     * The following is not yet supported:
     * A type that has a property with a
     * union type that has a member with a
     * nested type that itself has a property with a union type
     *
     * We should update our algorithm when we have a need for this.
     */
    describe(`when there is a nested type that leverages another union`, () => {
        const shapeDiscriminantPath = 'type';

        const SHAPE_UNION = 'SHAPE_UNION';

        @UnionMember(SHAPE_UNION, 'square')
        class Square {
            type = 'square';
        }

        @UnionMember(SHAPE_UNION, 'circle')
        class Circle {
            type = 'circle';
        }

        class Thing3Rating {
            @NonNegativeFiniteNumber({
                label: 'durability',
                description: 'numeric rating as to how durable this thing 3 is',
            })
            durability: number;

            @Union(SHAPE_UNION, shapeDiscriminantPath, {
                label: 'shape',
                description: 'shape of this thing',
            })
            shape: Circle | Square;
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

        it('should throw (not yet supported)', () => {
            const act = () =>
                resolveMemberSchemasForUnion(
                    [
                        Widget,
                        ThingDataOne,
                        ThingDataTwo,
                        ThingDataThree,
                        Thing3Rating,
                        ToolRoom,
                        Circle,
                        Square,
                    ],
                    'THING_UNION'
                );

            expect(act).toThrow();
        });
    });

    describe(`when there is a union member that iteslf has a union-valued property`, () => {
        const shapeDiscriminantPath = 'type';

        const SHAPE_UNION = 'SHAPE_UNION';

        @UnionMember(SHAPE_UNION, 'square')
        class Square {
            type = 'square';
        }

        @UnionMember(SHAPE_UNION, 'circle')
        class Circle {
            type = 'circle';
        }

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

            @Union(SHAPE_UNION, shapeDiscriminantPath, {
                label: 'shape',
                description: 'shape of this thing',
            })
            shape: Circle | Square;
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

        it('should throw (not yet supported)', () => {
            const result = resolveMemberSchemasForUnion(
                [
                    Widget,
                    ThingDataOne,
                    ThingDataTwo,
                    ThingDataThree,
                    Thing3Rating,
                    ToolRoom,
                    Circle,
                    Square,
                ],
                'THING_UNION'
            );

            assertMembersResolved(result, 3, ['one', 'two', 'three']);
        });
    });

    describe(`when there is a circular dependency`, () => {
        const shapeDiscriminantPath = 'type';

        const SHAPE_UNION = 'SHAPE_UNION';

        @UnionMember(SHAPE_UNION, 'square')
        class Square {
            type = 'square';

            @Union('THING_UNION', 'type', {
                label: 'thing',
                description: 'thing- circular union reference to parent',
            })
            thing: ThingDataOne | ThingDataTwo | ThingDataThree;
        }

        @UnionMember(SHAPE_UNION, 'circle')
        class Circle {
            type = 'circle';
        }

        class Thing3Rating {
            @NonNegativeFiniteNumber({
                label: 'durability',
                description: 'numeric rating as to how durable this thing 3 is',
            })
            durability: number;

            @Union(SHAPE_UNION, shapeDiscriminantPath, {
                label: 'shape',
                description: 'shape of this thing',
            })
            shape: Circle | Square;
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

        it('should throw', () => {
            const act = () =>
                resolveMemberSchemasForUnion(
                    [
                        Widget,
                        ThingDataOne,
                        ThingDataTwo,
                        ThingDataThree,
                        Thing3Rating,
                        ToolRoom,
                        Circle,
                        Square,
                    ],
                    'THING_UNION'
                );

            expect(act).toThrow(new UnionLeveragesAnotherException('THING_UNION'));
        });
    });
});
