import { ThingUnion } from '../../../test/widget';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    Union,
    UnionMember,
    UnionType,
} from '../../decorators';
import { TypeDecoratorOptions } from '../../decorators/types/TypeDecoratorOptions';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { bootstrapDynamicTypes } from './bootstrapDynamicTypes';

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

@Union(MACHINE_UNION, 'type')
class MachineUnion {}

const MachineUnionType = (options: TypeDecoratorOptions) => UnionType(MACHINE_UNION, options);

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

const expectDataSchemaToMatchSnapshot = (ctor: unknown) => {
    expect(getCoscradDataSchema(ctor)).toMatchSnapshot();
};

describe(`bootstrapDynamicTypes`, () => {
    describe(`when several union members have been registered`, () => {
        describe(`when the input is valid`, () => {
            describe(`when only one class property has been decorated`, () => {
                it.only(`should append the data-schema to the metadata`, () => {
                    const initialDataSchema = getCoscradDataSchema(FactoryRoom);

                    bootstrapDynamicTypes([
                        Whatsit,
                        Widget,
                        FactoryRoom,
                        Undecorated,
                        MachineUnion,
                    ]);

                    expectDataSchemaToMatchSnapshot(FactoryRoom);

                    const finalDataSchema = getCoscradDataSchema(FactoryRoom);

                    expect(initialDataSchema).not.toEqual(finalDataSchema);
                });
            });

            describe(`when multiple classes have a property that has been decorated`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    bootstrapDynamicTypes(
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [Whatsit, Widget, Undecorated, FactoryRoom, ProductionLine, ThingUnion]
                    );

                    expectDataSchemaToMatchSnapshot(FactoryRoom);

                    expectDataSchemaToMatchSnapshot(ProductionLine);
                });
            });

            describe(`when there is a nested property that leverages a union type`, () => {
                it(`should append the data-schema to the metadata`, () => {
                    bootstrapDynamicTypes(
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [
                            ThingUnion,
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
            @UnionType(LONELY_UNION, {
                label: 'foo',
                description: `bar can be as lonely as foo, it's the loneliest var in the village hoo`,
            })
            foo: unknown;
        }

        it(`should throw`, () => {
            const act = () =>
                bootstrapDynamicTypes([
                    ThingUnion,
                    Whatsit,
                    Widget,
                    FactoryRoom,
                    Undecorated,
                    LonelyUnionUser,
                ]);

            expect(act).toThrow();
        });
    });

    describe(`when two unions have been defined with the same name`, () => {
        it.todo(`should have a test`);
    });

    describe(`when two union members have registered the same discriminant value`, () => {
        // Duplicates Widget discriminant value
        @UnionMember(MACHINE_UNION, 'widget')
        class WidgetWannabe {
            type = 'widget';

            @NonEmptyString(buildOptions('name'))
            name: string;
        }

        it(`should throw`, () => {
            const act = () =>
                bootstrapDynamicTypes([
                    ThingUnion,
                    Whatsit,
                    Widget,
                    FactoryRoom,
                    Undecorated,
                    WidgetWannabe,
                ]);

            expect(act).toThrow();
        });
    });
});
