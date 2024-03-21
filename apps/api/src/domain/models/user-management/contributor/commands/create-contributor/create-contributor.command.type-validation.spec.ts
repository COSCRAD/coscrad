import { AggregateType } from '@coscrad/api-interfaces';
import { plainToInstance } from 'class-transformer';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { AggregateId } from '../../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../../../../test-data/commands';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import validateCommandPayloadType from '../../../../shared/command-handlers/utilities/validateCommandPayloadType';
import { CreateContributor } from './create-contributor.command';

const commandType = 'CREATE_CONTRIBUTOR';

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<CreateContributor>;

const firstName = "the contributor's first name";

const lastName = "the contributor's last name";

const dateOfBirth = "the contributor's date of birth";

const shortBio = "a contributor's short bio";

const commandFsaFactory = new DummyCommandFsaFactory<CreateContributor>((id: AggregateId) =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.contributor, id },
            firstName,
            lastName,
            dateOfBirth,
            shortBio,
        },
    })
);

describe(`${commandType} (payload type validation)`, () => {
    describe(`when the command payload type is invalid`, () => {
        describe(`when the aggregate type is not contributor`, () => {
            Object.values(AggregateType)
                .filter((aggregateType) => aggregateType !== AggregateType.contributor)
                .forEach((invalidAggregateType) => {
                    const invalidFsa = commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            type: invalidAggregateType,
                        },
                    });

                    const commandInstance = plainToInstance(CreateContributor, invalidFsa.payload);

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
            generateCommandFuzzTestCases(CreateContributor).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', () => {
                            const invalidFsa = commandFsaFactory.build(undefined, {
                                aggregateCompositeIdentifier: {
                                    [propertyName]: invalidValue,
                                },
                            });

                            const commandInstance = plainToInstance(
                                CreateContributor,
                                invalidFsa.payload
                            );

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
