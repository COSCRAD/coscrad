import { IsNotEmpty, IsString, ValidationOptions } from 'class-validator';

export const isStringWithNonzeroLength = (test: unknown): test is string =>
    typeof test === 'string' && test.length > 0;

export function IsStringWithNonzeroLength(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line
    return function (target: object, propertyName: string): void {
        IsString(validationOptions)(target, propertyName);
        IsNotEmpty(validationOptions)(target, propertyName);
    };
}
