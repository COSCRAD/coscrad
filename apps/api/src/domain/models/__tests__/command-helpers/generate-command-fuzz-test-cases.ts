import { ICommand } from '@coscrad/commands';
import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { Ctor } from '../../../../lib/types/Ctor';

type CommandFuzzTestCase = {
    propertyName: string;
    invalidValue: unknown;
    description: string;
};

export const generateCommandFuzzTestCases = (
    CommandCtor: Ctor<ICommand>
): CommandFuzzTestCase[] => {
    const dataSchema = getCoscradDataSchema(CommandCtor);

    return Object.entries(dataSchema).flatMap(([propertyName, propertySchema]) =>
        new FuzzGenerator(propertySchema)
            .generateInvalidValues()
            .map(({ value, description }) => ({
                propertyName,
                invalidValue: value,
                description,
            }))
            .concat({
                propertyName: 'bogusProperty',
                invalidValue: ['I am oh so bogus!'],
                description: 'superfluous (bogus) property key',
            })
    );
};
