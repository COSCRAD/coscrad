import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

interface Ctor<T> {
    new (...args): T;
}

interface SimpleValidator {
    (input: unknown): ValidationError[];
}

/* eslint-disable @typescript-eslint/ban-types */
export default (ModelCtor: Ctor<Object>): SimpleValidator =>
    (input: unknown) => {
        const instanceToValidate = plainToInstance(ModelCtor, input, {
            enableImplicitConversion: false,
        });

        return validateSync(instanceToValidate, {
            skipMissingProperties: false,
        });
    };
