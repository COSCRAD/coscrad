import { CommandModule } from '@coscrad/commands';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import createTestModule from '../__tests__/createTestModule';
import { CommandInfoService } from './services/command-info-service';

describe('command payload schemas', () => {
    let commandInfoService: CommandInfoService;

    beforeAll(async () => {
        const testModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        await testModule.get<CommandModule>(CommandModule).onApplicationBootstrap();

        commandInfoService = testModule.get<CommandInfoService>(CommandInfoService);
    });

    describe(`Command payload schema`, () => {
        it(`should match the snapshot`, () => {
            const schema = commandInfoService.getCommandSchemasWithMetadata();

            expect(schema).toMatchSnapshot();
        });
    });
});
