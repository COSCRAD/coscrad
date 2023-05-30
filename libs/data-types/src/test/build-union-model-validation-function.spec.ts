import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    Union2,
    Union2Member,
} from '../lib/decorators';
import { TypeDecoratorOptions } from '../lib/decorators/types/TypeDecoratorOptions';
import { buildUnionModelValidationFunction } from '../lib/validation/build-union-model-validation-function';

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

const validWhatsit: Whatsit = {
    type: 'whatsit',
    name: 'front-line whatsit',
    properties: {
        power: 5,
        class: 'high-grade',
    },
};

describe(`buildUnionModelValidationFunction`, () => {
    describe(`when several union members have been registered`, () => {
        describe(`when the input is valid`, () => {
            describe(`when only one class property has been decorated`, () => {
                it(`should return no errors`, () => {
                    const validationFunction = buildUnionModelValidationFunction(
                        MACHINE_UNION,
                        [Whatsit, Widget, FactoryRoom, Undecorated],
                        { forbidUnknownValues: false }
                    );

                    const result = validationFunction(validWhatsit);

                    expect(result).toEqual([]);
                });
            });

            describe(`when multiple classes have a property that has been decorated`, () => {
                it(`should return no errors`, () => {
                    const validationFunction = buildUnionModelValidationFunction(
                        MACHINE_UNION,
                        // FactoryRoom and ProductionLine both leverage a union decorator for the same union
                        [Whatsit, Widget, Undecorated, FactoryRoom, ProductionLine],
                        { forbidUnknownValues: false }
                    );

                    const result = validationFunction(validWhatsit);

                    expect(result).toEqual([]);
                });
            });
        });

        describe(`when the input is invalid`, () => {
            describe(`when there is a matching type discriminant on the invalid instance`, () => {
                const invalidWhatsit = {
                    ...validWhatsit,
                    properties: {
                        ...validWhatsit.properties,
                        // this should be a non-empty string
                        class: [10],
                    },
                };

                it(`should return the appropriate error`, () => {
                    const validationFunction = buildUnionModelValidationFunction(
                        MACHINE_UNION,
                        [Whatsit, Widget, FactoryRoom, Undecorated],
                        { forbidUnknownValues: false }
                    );

                    const result = validationFunction(invalidWhatsit);

                    expect(result.length).toBe(1);

                    const doesErrorMessageIncludePropertyName = result[0]
                        .toString()
                        .includes('class');

                    expect(doesErrorMessageIncludePropertyName).toBe(true);
                });
            });

            describe(`when there is an unregistered type discriminant on the instance`, () => {
                const invalidWhatsit = {
                    ...validWhatsit,
                    type: 'bogus-discriminant-value',
                };

                it(`should return the expected error`, () => {
                    const validationFunction = buildUnionModelValidationFunction(
                        MACHINE_UNION,
                        [Whatsit, Widget, FactoryRoom, Undecorated],
                        { forbidUnknownValues: false }
                    );

                    const result = validationFunction(invalidWhatsit);

                    expect(result.length).toBe(1);
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
                buildUnionModelValidationFunction(
                    LONELY_UNION,
                    [Whatsit, Widget, FactoryRoom, Undecorated, LonelyUnionUser],
                    { forbidUnknownValues: false }
                );

            expect(act).toThrow();
        });
    });

    describe(`when the union has not been registered`, () => {
        const UNREGISTERED_UNION = 'UNREGISTERED_UNION';

        @Union2Member(UNREGISTERED_UNION, `boo`)
        class OrphanMember {
            foo: unknown;
        }

        it(`should throw`, () => {
            const act = () =>
                buildUnionModelValidationFunction(
                    UNREGISTERED_UNION,
                    [Whatsit, Widget, FactoryRoom, Undecorated, OrphanMember],
                    { forbidUnknownValues: false }
                );

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
                buildUnionModelValidationFunction(
                    DUPLICATED_UNION,
                    [
                        Whatsit,
                        Widget,
                        FactoryRoom,
                        Undecorated,
                        Woo,
                        Boo,
                        UnionMemberA,
                        UnionMemberB,
                    ],
                    { forbidUnknownValues: false }
                );

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
                buildUnionModelValidationFunction(
                    MACHINE_UNION,
                    [Whatsit, Widget, FactoryRoom, Undecorated, WidgetWannabe],
                    { forbidUnknownValues: false }
                );

            expect(act).toThrow();
        });
    });
});
