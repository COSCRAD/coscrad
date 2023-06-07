import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    Union2,
    Union2Member,
} from '../../decorators';
import { TypeDecoratorOptions } from '../../decorators/types/TypeDecoratorOptions';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { bootstrapDynamicTypes } from './bootstrap-dynamic-types';

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

@Union2Member(MACHINE_UNION, 'widget')
class Widget {
    type = 'widget';

    @NonEmptyString(buildOptions('widget'))
    name: string;
}

@Union2Member(MACHINE_UNION, 'whatsit')
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

const MachineUnion = (options: TypeDecoratorOptions) => Union2(MACHINE_UNION, 'type', options);

class FactoryRoom {
    @MachineUnion({
        label: 'machine',
        description: 'the machine that is in this factory room',
    })
    machine: Widget | Whatsit;
}

class ProductionLine {
    @MachineUnion({
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

const expectDataSchemaToMatchSnapshot = (ctor: unknown) => {
    expect(getCoscradDataSchema(ctor)).toMatchSnapshot();
};

describe(`bootstrapDynamicTypes`, () => {
    describe(`when several union members have been registered`, () => {
        describe.only(`when the input is valid`, () => {
            describe(`when only one class property has been decorated`, () => {
                it.only(`should append the data-schema to the metadata`, () => {
                    const initialDataSchema = getCoscradDataSchema(FactoryRoom);

                    bootstrapDynamicTypes([Whatsit, Widget, FactoryRoom, Undecorated]);

                    expectDataSchemaToMatchSnapshot(FactoryRoom);

                    const finalDataSchema = getCoscradDataSchema(FactoryRoom);

                    expect(initialDataSchema).not.toEqual(finalDataSchema);
                });
            });

            describe(`when multiple classes have a property that has been decorated`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    bootstrapDynamicTypes(
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [Whatsit, Widget, Undecorated, FactoryRoom, ProductionLine]
                    );

                    expectDataSchemaToMatchSnapshot(FactoryRoom);

                    expectDataSchemaToMatchSnapshot(ProductionLine);
                });
            });

            describe(`when there is a nested property that leverages a union type`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    const unionMap = bootstrapDynamicTypes(
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [
                            Whatsit,
                            Widget,
                            // Undecorated,
                            FactoryRoom,
                            // ProductionLine,
                            HasNestedUnionProperty,
                        ]
                    );

                    expectDataSchemaToMatchSnapshot(HasNestedUnionProperty);
                });
            });
        });
    });

    describe(`when no union members have been registered`, () => {
        const LONELY_UNION = 'LONELY_HEARTS_CLUB';

        class LonelyUnionUser {
            @Union2(LONELY_UNION, 'type', {
                label: 'foo',
                description: `bar can be as lonely as foo, it's the loneliest var in the village hoo`,
            })
            foo: unknown;
        }

        it(`should throw`, () => {
            const act = () =>
                bootstrapDynamicTypes([Whatsit, Widget, FactoryRoom, Undecorated, LonelyUnionUser]);

            expect(act).toThrow();
        });
    });

    describe(`when the same union has been registered twice with inconsistent discriminant paths`, () => {
        const DUPLICATED_UNION = 'DUPLICATED_UNION';

        class Woo {
            @Union2(DUPLICATED_UNION, 'type', buildOptions('foo'))
            foo: unknown;
        }

        class Boo {
            @Union2(DUPLICATED_UNION, 'inconsistentDiscriminantFieldName', buildOptions('baz'))
            baz: unknown;
        }

        @Union2Member(DUPLICATED_UNION, 'A')
        class UnionMemberA {
            inconsistentDiscriminantFieldName = 'A';
        }

        @Union2Member(DUPLICATED_UNION, 'B')
        class UnionMemberB {
            type = 'B';
        }

        it(`should throw`, () => {
            const act = () =>
                bootstrapDynamicTypes([
                    Whatsit,
                    Widget,
                    FactoryRoom,
                    Undecorated,
                    Woo,
                    Boo,
                    UnionMemberA,
                    UnionMemberB,
                ]);

            expect(act).toThrow();
        });
    });

    describe(`when two union members have registered the same discriminant value`, () => {
        // Duplicates Widget discriminant value
        @Union2Member(MACHINE_UNION, 'widget')
        class WidgetWannabe {
            type = 'widget';

            @NonEmptyString(buildOptions('name'))
            name: string;
        }

        it(`should throw`, () => {
            const act = () =>
                bootstrapDynamicTypes([Whatsit, Widget, FactoryRoom, Undecorated, WidgetWannabe]);

            expect(act).toThrow();
        });
    });
});
