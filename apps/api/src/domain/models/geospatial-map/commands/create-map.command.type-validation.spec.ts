import { plainToInstance } from 'class-transformer';
import { InternalError } from '../../../../lib/errors/InternalError';
import { buildTestInstance } from '../../../../test-data/utilities';
import { AggregateType } from '../../../types/AggregateType';
import validateCommandPayloadType from '../../shared/command-handlers/utilities/validateCommandPayloadType';
import { DummyCommandFsaFactory } from '../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CreateMap } from './create-map.command';

const commandType = 'CREATE_MAP';

// TODO use buildTestInstance
const dummyPayload = buildTestInstance(CreateMap, {});

const dummyFsa = { type: commandType, payload: dummyPayload };

const commandFsaFactory = new DummyCommandFsaFactory<CreateMap>(() => dummyFsa);

describe(`${commandType} (payload type validation)`, () => {
    describe(`when the command payload type is invalid`, () => {
        describe(`when the aggregate type is not map`, () => {
            Object.values(AggregateType)
                .filter((aggregateType) => aggregateType !== AggregateType.map)
                .forEach((invalidAggregateType) => {
                    const invalidFsa = commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            type: invalidAggregateType,
                        },
                    });

                    const commandInstance = plainToInstance(CreateMap, invalidFsa.payload);

                    const result = validateCommandPayloadType(commandInstance, commandType);

                    expect(result).toBeInstanceOf(InternalError);

                    const error = result as InternalError;

                    const messagesToCheck = [error.toString()];

                    const errorMessagesThatDoNotReferencePropertyName = messagesToCheck.filter(
                        (msg) => !msg.includes('aggregateCompositeIdentifier')
                    );

                    expect(errorMessagesThatDoNotReferencePropertyName).toEqual([]);
                });
        });

        describe(`fuzz test`, () => {
            generateCommandFuzzTestCases(CreateMap).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', () => {
                            const invalidFsa = commandFsaFactory.build(undefined, {
                                aggregateCompositeIdentifier: {
                                    [propertyName]: invalidValue,
                                },
                            });

                            const commandInstance = plainToInstance(CreateMap, invalidFsa.payload);

                            const result = validateCommandPayloadType(commandInstance, commandType);

                            expect(result).toBeInstanceOf(InternalError);

                            const error = result as InternalError;

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
