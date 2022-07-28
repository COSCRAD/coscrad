import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
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

        const additionalOptions = forbidUnknownValues
            ? {
                  forbidUnknownValues,
                  /**
                   * TODO [https://www.pivotaltracker.com/story/show/182840162]
                   * Alias the following props in favor of more inclusive identifiers.
                   */
                  forbidNonWhitelisted: true,
                  whitelist: true,
              }
            : {};

        return validateSync(instanceToValidate, {
            skipMissingProperties: false,
            ...additionalOptions,
        });
    };
