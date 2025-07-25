import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateCompositeIdentifier,
    AggregateType,
    CoscradUserRole,
    HttpStatusCode,
    ICommandBase,
} from '@coscrad/api-interfaces';
import {
    Ack,
    Command,
    CommandHandler,
    CommandHandlerService,
    CommandModule,
    ICommandHandler,
} from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtStrategy } from '../../../authorization/jwt.strategy';
import { MockJwtAdminAuthGuard } from '../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtStrategy } from '../../../authorization/mock-jwt.strategy';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateTypeProperty } from '../../../domain/models/shared/common-commands';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../test-data/utilities';
import buildMockConfigService from '../../config/__tests__/utilities/buildMockConfigService';
import { ArangoBulkJobRepository } from './bulk-imports/arango-bulk-job-repository';
import { BULK_JOB_REPOSITORY_INJECTION_TOKEN } from './bulk-imports/bulk-job-repository.interface';
import { CommandFSA } from './command-fsa/command-fsa.entity';
import { AdminJwtGuard, CommandController } from './command.controller';

const CREATE_WIDGET = 'CREATE_WIDGET';

class WidgetCompositeId {
    @AggregateTypeProperty(['widget' as AggregateType])
    readonly type = 'widget' as AggregateType;

    @UUID({
        label: 'ID',
        description: 'system ID',
    })
    id: string;
}

@Command({ type: CREATE_WIDGET })
class CreateWidget implements ICommandBase {
    @NestedDataType(WidgetCompositeId, {
        label: 'composite ID',
        description: 'system wide identifier for the new widget',
    })
    [AGGREGATE_COMPOSITE_IDENTIFIER]: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: 'name',
        description: 'the name of the new widget',
    })
    name: string;
}

@CommandHandler(CreateWidget)
class CreateWidgetCommandHandler implements ICommandHandler {
    execute(): Promise<Ack | Error> {
        return Promise.resolve(Ack);
    }
}

const endpointUnderTest = `/commands/validate`;

const validCreateCommand: CommandFSA<CreateWidget> = {
    type: 'CREATE_WIDGET',
    payload: {
        aggregateCompositeIdentifier: {
            type: 'widget' as AggregateType,
            id: buildDummyUuid(1),
        },
        name: 'washing machine',
    },
};

const testAdminUser = buildTestInstance(CoscradUser, {
    roles: [CoscradUserRole.superAdmin],
});

const testUserWithGroups = new CoscradUserWithGroups(testAdminUser, []);

const invalidType = 'WIDGET_DEMYSTIFIED';

const commandFsaWithInvalidType = {
    type: invalidType,
    payload: validCreateCommand.payload,
};

// There is a separate RBAC test to ensure only admin can activate this endpoint
describe(`Command execution: validate command stream`, () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), IdGenerationModule, CommandModule],
            providers: [
                {
                    provide: JwtStrategy,
                    useFactory: () => new MockJwtStrategy(testUserWithGroups),
                },
                {
                    provide: BULK_JOB_REPOSITORY_INJECTION_TOKEN,
                    useFactory: (connectionProvider: ArangoConnectionProvider) =>
                        new ArangoBulkJobRepository(connectionProvider),
                    inject: [ArangoConnectionProvider],
                },
            ],
            controllers: [CommandController],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(testUserWithGroups))
            .compile();

        app = module.createNestApplication();

        await app.init();

        app.get(CommandHandlerService).registerHandler(
            CREATE_WIDGET,
            new CreateWidgetCommandHandler()
        );
    });

    describe(`when the command stream is valid`, () => {
        const validStream = [validCreateCommand];

        it(`should return an OK response`, async () => {
            const response = await request(app.getHttpServer()).get(endpointUnderTest).send({
                stream: validStream,
            });

            expect(response.status).toBe(HttpStatusCode.ok);

            const { results } = response.body;

            expect(results).toHaveLength(validStream.length);
        });
    });

    describe(`when the command stream is invalid`, () => {
        describe(`when there is no command with the given type for one of the command FSAS`, () => {
            const unknownCommandType = 'BOOCUS_WIGGLED';

            const commandFsaWithInvalidType = {
                type: unknownCommandType,
                payload: validCreateCommand.payload,
            };

            it(`should return the expected error message`, async () => {
                const response = await request(app.getHttpServer())
                    .get(endpointUnderTest)
                    .send({
                        stream: [commandFsaWithInvalidType],
                    });

                expect(response.status).toBe(HttpStatusCode.badRequest);

                const {
                    body: { results },
                } = response;

                expect(results).toHaveLength(1);

                const { fsa, result } = results[0];

                expect(fsa).toEqual(commandFsaWithInvalidType);

                expect(result).toContain(`index [0]`);

                expect(result).toContain(`There is no handler registered for the command`);

                expect(result).toContain(unknownCommandType);
            });
        });

        describe(`when one of the command FSAs has an invalid type`, () => {
            it(`should return the expected error message`, async () => {
                const response = await request(app.getHttpServer())
                    .get(endpointUnderTest)
                    .send({
                        stream: [commandFsaWithInvalidType],
                    });

                expect(response.status).toBe(HttpStatusCode.badRequest);

                const {
                    body: { results },
                } = response;

                expect(results).toHaveLength(1);

                const { fsa, result } = results[0];

                expect(fsa).toEqual(commandFsaWithInvalidType);

                expect(result).toContain(invalidType);
            });
        });

        describe(`when the provided command stream is empty`, () => {
            it(`should return the expected error message`, async () => {
                const response = await request(app.getHttpServer()).get(endpointUnderTest).send({
                    stream: [],
                });

                expect(response.status).toBe(HttpStatusCode.badRequest);

                const {
                    body: { message },
                } = response;

                expect(message).toContain('must provide at least');
            });
        });

        describe(`when one of the command FSAs is missing a type property`, () => {
            it(`should return the expected result`, async () => {
                const fsaWithoutTypeProperty = { payload: validCreateCommand.payload };

                const stream = [validCreateCommand, fsaWithoutTypeProperty];

                const response = await request(app.getHttpServer()).get(endpointUnderTest).send({
                    stream,
                });

                expect(response.status).toBe(HttpStatusCode.badRequest);

                const {
                    body: { results },
                } = response;

                expect(results[0].fsa).toEqual(validCreateCommand);

                expect(results[0].result).toEqual('Ack');

                expect(results).toHaveLength(stream.length);

                const { fsa, result } = results[1];

                expect(fsa).toEqual(fsaWithoutTypeProperty);

                expect(result).toContain('must specify the type of command');
            });
        });

        describe(`when one of the command FSAs is missing a payload property`, () => {
            it(`should return the expected result`, async () => {
                const fsaWithoutTypeProperty = { type: validCreateCommand.type };

                const stream = [validCreateCommand, fsaWithoutTypeProperty];

                const response = await request(app.getHttpServer()).get(endpointUnderTest).send({
                    stream,
                });

                expect(response.status).toBe(HttpStatusCode.badRequest);

                const {
                    body: { results },
                } = response;

                expect(results[0].fsa).toEqual(validCreateCommand);

                expect(results[0].result).toEqual('Ack');

                expect(results).toHaveLength(stream.length);

                const { fsa, result } = results[1];

                expect(fsa).toEqual(fsaWithoutTypeProperty);

                expect(result).toContain('must provide a payload');
            });
        });

        // TODO disallow superfluous properties
    });
});
