import { plainToInstance } from 'class-transformer';
/* eslint-disable-next-line */
import { getCoscradDataSchema } from '@coscrad/data-types';
/* eslint-disable-next-line */
import { validateCoscradModelInstance } from '@coscrad/validation-constraints';
import { SimpleValidationFunction } from './interfaces/SimpleValidationFunction';

interface Ctor<T> {
    new (...args): T;
}

type Options = {
    forbidUnknownValues: boolean;
};

/* eslint-disable @typescript-eslint/ban-types */
export default (
        ModelCtor: Ctor<Object>,
        { forbidUnknownValues }: Options = { forbidUnknownValues: false }
    ): SimpleValidationFunction =>
    (input: unknown) => {
        const instanceToValidate = plainToInstance(ModelCtor, input, {
            enableImplicitConversion: false,
        });

        return validateCoscradModelInstance(
            getCoscradDataSchema(ModelCtor),
            instanceToValidate,
            forbidUnknownValues
        );
    };
