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

        console.log({ commandInfoService });
    });

    describe(`Command payload schema`, () => {
        it(`should match the snapshot`, () => {
            const schema = commandInfoService.getCommandSchemasWithMetadata();

            expect(schema).toMatchSnapshot();
        });

        // commandInfoService
        //     .getCommandSchemasWithMetadata()
        //     .map(({ type, schema }) => [type, schema])
        //     .forEach(([commandType, schema]) => {

        //         describe(`The schema for command ${commandType}`, () => {
        //             it('should have the expected value', () => {
        //                 expect(schema).toMatchSnapshot();
        //             });
        //         });
        //     });
    });
});
