import { FluxStandardAction, ICommand } from '@coscrad/commands';
import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Ctor } from '../../../../lib/types/Ctor';
import { AggregateId } from '../../../types/AggregateId';
import { assertCommandPayloadTypeError } from '../command-helpers/assert-command-payload-type-error';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';

export type InvalidFSAFactoryFunction<TCommand extends ICommand> = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof TCommand, unknown>>
) => FluxStandardAction<TCommand>;

export const assertCommandTypeErrorsWithFuzz = <TCommand extends ICommand>(
    { commandHandlerService, idManager }: CommandAssertionDependencies,
    CommandCtor: Ctor<ICommand>,
    invalidFSAFactoryFunction: InvalidFSAFactoryFunction<TCommand>
) => {
    const commandPayloadDataSchema = getCoscradDataSchema(CommandCtor);

    Object.entries(commandPayloadDataSchema).forEach(([propertyName, propertySchema]) => {
        const invalidValues = new FuzzGenerator(propertySchema).generateInvalidValues();

        invalidValues.forEach(({ value, description }) => {
            describe(`when the property: ${propertyName} has an invalid value: ${value} (${description})`, () => {
                it('should return the appropriate type error', async () => {
                    const validId = await idManager.generate();

                    const result = await commandHandlerService.execute(
                        invalidFSAFactoryFunction(validId, {
                            [propertyName]: value,
                            // TODO remove cast
                        } as unknown as TCommand)
                    );

                    expect(result).toBeInstanceOf(InternalError);

                    const error = result as InternalError;

                    assertCommandPayloadTypeError(error, propertyName);
                });
            });
        });
    });
};
