import { plainToInstance } from 'class-transformer';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { AggregateType } from '../../../../types/AggregateType';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import validateCommandPayloadType from '../../../shared/command-handlers/utilities/validateCommandPayloadType';
import { CreatePhotograph } from './create-photograph.command';

const commandType = 'CREATE_PHOTOGRAPH';

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<CreatePhotograph>;

const commandFsaFactory = new DummyCommandFsaFactory<CreatePhotograph>((id) =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier: { id },
        },
    })
);

/**
 * We have moved these comprehensive payload type validation tests here to
 * a (closer to) unit test and out of the integration (almost e2e) command
 * test that uses the API and live database over the network.
 *
 * This is because the cost of driving the network doesn't justify the marginal
 * gain in confidence.
 */
describe(`${commandType} (payload type validation)`, () => {
    describe(`when the command payload type is invalid`, () => {
        describe(`when the aggregate type is not photograph`, () => {
            Object.values(AggregateType)
                .filter((aggregateType) => aggregateType !== AggregateType.photograph)
                .forEach((invalidAggregateType) => {
                    // TODO add a test helper for this
                    const invalidFsa = commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            type: invalidAggregateType,
                        },
                    });

                    const commandInstance = plainToInstance(CreatePhotograph, invalidFsa.payload);

                    const result = validateCommandPayloadType(commandInstance, commandType);

                    expect(result).toBeInstanceOf(InternalError);

                    const error = result as InternalError;

                    // This pattern logs the failing message on failure
                    const messagesToCheck = [error.toString()];

                    const errorMessagesThatDoNotReferencePropertyName = messagesToCheck.filter(
                        (msg) => !msg.includes('aggregateCompositeIdentifier')
                    );

                    expect(errorMessagesThatDoNotReferencePropertyName).toEqual([]);
                });
        });

        describe(`fuzz test`, () => {
            generateCommandFuzzTestCases(CreatePhotograph).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', () => {
                            // TODO add a test helper for this
                            const invalidFsa = commandFsaFactory.build(undefined, {
                                aggregateCompositeIdentifier: {
                                    [propertyName]: invalidValue,
                                },
                            });

                            const commandInstance = plainToInstance(
                                CreatePhotograph,
                                invalidFsa.payload
                            );

                            const result = validateCommandPayloadType(commandInstance, commandType);

                            expect(result).toBeInstanceOf(InternalError);

                            const error = result as InternalError;

                            // This pattern logs the failing message on failure
                            const messagesToCheck = [error.toString()];

                            const errorMessagesThatDoNotReferencePropertyName =
                                messagesToCheck.filter((msg) => !msg.includes(propertyName));

                            expect(errorMessagesThatDoNotReferencePropertyName).toEqual([]);
                        });
                    });
                }
            );
        });
    });
});
