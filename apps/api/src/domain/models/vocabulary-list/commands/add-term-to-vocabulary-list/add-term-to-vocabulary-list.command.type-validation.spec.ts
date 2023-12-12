import { AggregateType } from '@coscrad/api-interfaces';
import { plainToInstance } from 'class-transformer';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import validateCommandPayloadType from '../../../shared/command-handlers/utilities/validateCommandPayloadType';
import { AddTermToVocabularyList } from './add-term-to-vocabulary-list.command';

const commandType = 'ADD_TERM_TO_VOCABULARY_LIST';

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<AddTermToVocabularyList>;

const commandFsaFactory = new DummyCommandFsaFactory(() => dummyFsa);

describe(`${commandType} (payload type validation)`, () => {
    describe(`when the command payload type is invalid`, () => {
        describe(`when the aggregate type is not digital text`, () => {
            Object.values(AggregateType)
                .filter((aggregateType) => aggregateType !== AggregateType.digitalText)
                .forEach((invalidAggregateType) => {
                    describe(`when the type is: ${invalidAggregateType}`, () => {
                        it(`should fail with the expected error`, () => {
                            // TODO add a test helper for this
                            const invalidFsa = commandFsaFactory.build(undefined, {
                                aggregateCompositeIdentifier: {
                                    type: invalidAggregateType,
                                },
                            });

                            const commandInstance = plainToInstance(
                                AddTermToVocabularyList,
                                invalidFsa.payload
                            );

                            const result = validateCommandPayloadType(commandInstance, commandType);

                            expect(result).toBeInstanceOf(InternalError);

                            const error = result as InternalError;

                            // This pattern logs the failing message on failure
                            const messagesToCheck = [error.toString()];

                            const errorMessagesThatDoNotReferencePropertyName =
                                messagesToCheck.filter(
                                    (msg) => !msg.includes('aggregateCompositeIdentifier')
                                );

                            expect(errorMessagesThatDoNotReferencePropertyName).toEqual([]);
                        });
                    });
                });
        });

        describe(`fuzz test`, () => {
            generateCommandFuzzTestCases(AddTermToVocabularyList).forEach(
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
                                AddTermToVocabularyList,
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
