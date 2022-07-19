import { checkInvalidValues, checkValidValues } from '../string/IsStringWithNonzeroLength.spec';
import { CompositeIdentifier, IsCompositeIdentifier } from './IsCompositeIdentifier';

enum MachineType {
    widget = 'widget',
    whatsit = 'whatsit',
    thingy = 'thingy',
}

type TestIdType = string;

type TestCompositeIdentifierType = CompositeIdentifier<MachineType, TestIdType>;

const testIdTypeGuard = (input: unknown): input is string => typeof input === 'string';

describe('IsCompositeIdentifier', () => {
    class TestClass {
        @IsCompositeIdentifier(MachineType, testIdTypeGuard)
        testProperty: TestCompositeIdentifierType;
    }

    const validValues: TestCompositeIdentifierType[] = [
        {
            type: MachineType.widget,
            id: '123',
        },
        {
            type: MachineType.whatsit,
            id: 'uvflepwke2',
        },
        {
            type: MachineType.thingy,
            id: 'ab-123',
        },
    ];

    const invalidValues = [
        {
            type: 'poker',
            id: '13456',
        },
        {
            type: MachineType.widget,
            id: 90567,
        },
        {},
        {
            type: MachineType.whatsit,
        },
        {
            id: '123',
        },
        -100,
        Infinity,
        -Infinity,
        -5 / 3,
        '99',
        [99],
        null,
        undefined,
    ];

    describe('when the input is valid', () => {
        it('should return no validation errors', () =>
            checkValidValues(new TestClass(), validValues));
    });

    describe('when the input is invalid', () => {
        it('should return a validation error', () =>
            checkInvalidValues(new TestClass(), invalidValues));
    });
});
