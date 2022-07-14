import { ICommand } from '@coscrad/commands';
import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { Ctor } from '../../../../lib/types/Ctor';

type CommandFuzzTestCase = {
    propertyName: string;
    invalidValue: unknown;
    description: string;
};

export const generateCommandFuzzTestCases = (CommandCtor: Ctor<ICommand>): CommandFuzzTestCase[] =>
    Object.entries(getCoscradDataSchema(CommandCtor)).flatMap(([propertyName, propertySchema]) =>
        new FuzzGenerator(propertySchema).generateInvalidValues().map(({ value, description }) => ({
            propertyName,
            invalidValue: value,
            description,
        }))
    );
