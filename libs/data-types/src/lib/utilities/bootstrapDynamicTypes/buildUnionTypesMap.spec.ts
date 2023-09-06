import { buildUnionTypesMap, UnionTypesMap } from '.';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    Union,
    UnionMember,
    UnionType,
} from '../../decorators';
import { TypeDecoratorOptions } from '../../decorators/types/TypeDecoratorOptions';
import { Ctor } from '../getCoscradDataSchemaFromPrototype';

const MACHINE_UNION = 'MACHINE_UNION';

const buildOptions = (propertyName) => ({
    label: `label-for-${propertyName}`,
    description: `description-of-${propertyName}`,
});

class WhatsitProperty {
    @NonNegativeFiniteNumber(buildOptions('power'))
    power: number;

    @NonEmptyString(buildOptions('whatsit'))
    class: string;
}

@UnionMember(MACHINE_UNION, 'widget')
class Widget {
    type = 'widget';

    @NonEmptyString(buildOptions('widget'))
    name: string;
}

@UnionMember(MACHINE_UNION, 'whatsit')
class Whatsit {
    type = 'whatsit';

    name: string;

    @NestedDataType(WhatsitProperty, buildOptions('properties'))
    properties: WhatsitProperty;
}

class Undecorated {
    foo: number;

    bar: string;
}

const MachineUnionType = (options: TypeDecoratorOptions) => UnionType(MACHINE_UNION, options);

@Union(MACHINE_UNION, 'type')
class MachineUnion {}

class FactoryRoom {
    @MachineUnionType({
        label: 'machine',
        description: 'the machine that is in this factory room',
    })
    machine: Widget | Whatsit;
}

class ProductionLine {
    @MachineUnionType({
        label: 'machines',
        description: `all machines that are part of this line, in order`,
    })
    machines: (Widget | Whatsit)[];
}

class HasNestedUnionProperty {
    @NestedDataType(FactoryRoom, buildOptions('factoryRoom'))
    factoryRoom: FactoryRoom;
}

type DiscriminantAndCtorName = {
    discriminant: string;
    ctorName: string;
};

const assertUnionMapAsExpected = (
    unionName: string,
    unionMap: UnionTypesMap,
    expectedDiscriminantsAndCtorNames: DiscriminantAndCtorName[]
) => {
    expect(unionMap.has(unionName)).toBe(true);

    const { membersMap } = unionMap.get(unionName);

    const unmatchedDiscriminants = expectedDiscriminantsAndCtorNames.filter(
        ({ discriminant, ctorName }) =>
            !membersMap.has(discriminant) || membersMap.get(discriminant).name !== ctorName
    );

    expect(unmatchedDiscriminants).toEqual([]);
};

describe(`buildUnionTypesMap`, () => {
    describe(`when several union members have been registered`, () => {
        describe(`when the input is valid`, () => {
            describe(`when only one class property has been decorated`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    const unionMap = buildUnionTypesMap([
                        MachineUnion,
                        Whatsit,
                        Widget,
                        FactoryRoom,
                        Undecorated,
                    ] as Ctor<unknown>[]);

                    assertUnionMapAsExpected(MACHINE_UNION, unionMap, [
                        {
                            discriminant: 'whatsit',
                            ctorName: 'Whatsit',
                        },
                        {
                            discriminant: 'widget',
                            ctorName: 'Widget',
                        },
                    ]);
                });
            });

            describe(`when multiple classes have a property that has been decorated`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    const unionMap = buildUnionTypesMap(
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [
                            MachineUnion,
                            Whatsit,
                            Widget,
                            Undecorated,
                            FactoryRoom,
                            ProductionLine,
                        ] as Ctor<unknown>[]
                    );

                    assertUnionMapAsExpected(MACHINE_UNION, unionMap, [
                        {
                            discriminant: 'whatsit',
                            ctorName: 'Whatsit',
                        },
                        {
                            discriminant: 'widget',
                            ctorName: 'Widget',
                        },
                    ]);
                });
            });

            describe(`when there is a nested property that leverages a union type`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    const unionMap = buildUnionTypesMap(
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [
                            MachineUnion,
                            Whatsit,
                            Widget,
                            // Undecorated,
                            FactoryRoom,
                            // ProductionLine,
                            HasNestedUnionProperty,
                        ] as Ctor<unknown>[]
                    );

                    assertUnionMapAsExpected(MACHINE_UNION, unionMap, [
                        {
                            discriminant: 'whatsit',
                            ctorName: 'Whatsit',
                        },
                        {
                            discriminant: 'widget',
                            ctorName: 'Widget',
                        },
                    ]);
                });
            });
        });
    });

    describe(`when no union members have been registered`, () => {
        const LONELY_UNION = 'LONELY_HEARTS_CLUB';

        @Union(LONELY_UNION, 'discriminantPropertyName')
        class LonelyUnion {}

        class LonelyUnionUser {
            @UnionType(LONELY_UNION, {
                label: 'foo',
                description: `bar can be as lonely as foo, it's the loneliest var in the village hoo`,
            })
            foo: unknown;
        }

        it(`should throw`, () => {
            const act = () =>
                buildUnionTypesMap([
                    LonelyUnion,
                    Whatsit,
                    Widget,
                    FactoryRoom,
                    Undecorated,
                    LonelyUnionUser,
                ] as Ctor<unknown>[]);

            expect(act).toThrow();
        });
    });

    describe(`when the same union has been registered twice`, () => {
        const DUPLICATED_UNION = 'DUPLICATED_UNION';

        /**
         * TODO Can we design away this possibility? Can we use reflection to
         * get the class name and make it the union name?
         */
        @Union(DUPLICATED_UNION, 'path1')
        class DuplicatedUnion1 {}

        @Union(DUPLICATED_UNION, 'path2')
        class DuplicatedUnion2 {}

        class Woo {
            @UnionType(DUPLICATED_UNION, buildOptions('foo'))
            foo: unknown;
        }

        @UnionMember(DUPLICATED_UNION, 'A')
        class UnionMemberA {
            inconsistentDiscriminantFieldName = 'A';
        }

        @UnionMember(DUPLICATED_UNION, 'B')
        class UnionMemberB {
            type = 'B';
        }

        it(`should throw`, () => {
            const act = () =>
                buildUnionTypesMap([
                    DuplicatedUnion1,
                    DuplicatedUnion2,
                    Whatsit,
                    Widget,
                    FactoryRoom,
                    Undecorated,
                    Woo,
                    UnionMemberA,
                    UnionMemberB,
                ] as Ctor<unknown>[]);

            expect(act).toThrow();
        });
    });

    describe(`when two unions have the same name but a different discriminantPath`, () => {
        // Duplicates Widget discriminant value
        @Union(MACHINE_UNION, 'inconsistentPropertyPath')
        class DuplicateMachineUnion {
            type = 'widget';

            @NonEmptyString(buildOptions('name'))
            name: string;
        }

        it(`should throw`, () => {
            const act = () =>
                buildUnionTypesMap([
                    MachineUnion,
                    Whatsit,
                    Widget,
                    FactoryRoom,
                    Undecorated,
                    DuplicateMachineUnion,
                ] as Ctor<unknown>[]);

            expect(act).toThrow();
        });
    });
});
