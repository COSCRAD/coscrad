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

        describe(`when the input is invalid`, () => {
            const invalidWhatsit = {
                ...validWhatsit,
                properties: {
                    ...validWhatsit.properties,
                    // this should be a non-empty string
                    class: [10],
                },
            };

            const validationFunction = buildUnionModelValidationFunction(
                MACHINE_UNION,
                [Whatsit, Widget, FactoryRoom, Undecorated],
                { forbidUnknownValues: false }
            );

            const result = validationFunction(invalidWhatsit);

            expect(result.length).toBe(1);

            const doesErrorMessageIncludePropertyName = result[0].toString().includes('class');

            expect(doesErrorMessageIncludePropertyName).toBe(true);
        });
    });
});
