import { plainToInstance } from 'class-transformer';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { buildTestCommandFsaMap } from '../../../../../../test-data/commands';
import { AggregateType } from '../../../../../types/AggregateType';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import validateCommandPayloadType from '../../../../shared/command-handlers/utilities/validateCommandPayloadType';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-citation.command';

const commandType = 'REGISTER_DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION';

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<RegisterDigitalRepresentationOfBibliographicCitation>;

const commandFsaFactory =
    new DummyCommandFsaFactory<RegisterDigitalRepresentationOfBibliographicCitation>(
        () => dummyFsa
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
        describe(`when the aggregate type is not digital text`, () => {
            Object.values(AggregateType)
                .filter((aggregateType) => aggregateType !== AggregateType.bibliographicCitation)
                .forEach((invalidAggregateType) => {
                    // TODO add a test helper for this
                    const invalidFsa = commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            type: invalidAggregateType,
                        },
                    });

                    const commandInstance = plainToInstance(
                        RegisterDigitalRepresentationOfBibliographicCitation,
                        invalidFsa.payload
                    );

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
            generateCommandFuzzTestCases(
                RegisterDigitalRepresentationOfBibliographicCitation
            ).forEach(({ description, propertyName, invalidValue }) => {
                describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                    it('should fail with the appropriate error', () => {
                        // TODO add a test helper for this
                        const invalidFsa = commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                [propertyName]: invalidValue,
                            },
                        });

                        const commandInstance = plainToInstance(
                            RegisterDigitalRepresentationOfBibliographicCitation,
                            invalidFsa.payload
                        );

                        const result = validateCommandPayloadType(commandInstance, commandType);

                        expect(result).toBeInstanceOf(InternalError);

                        const error = result as InternalError;

                        // This pattern logs the failing message on failure
                        const messagesToCheck = [error.toString()];

                        const errorMessagesThatDoNotReferencePropertyName = messagesToCheck.filter(
                            (msg) => !msg.includes(propertyName)
                        );

                        expect(errorMessagesThatDoNotReferencePropertyName).toEqual([]);
                    });
                });
            });
        });
    });
});
