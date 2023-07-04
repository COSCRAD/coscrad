import { CommandHandlerService } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { GrantUserRole } from '../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { RegisterUser } from '../domain/models/user-management/user/commands/register-user/register-user.command';
import { AggregateType } from '../domain/types/AggregateType';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type CommandFsa = {
    type: string;
    payload: {
        aggregateCompositeIdentifier: {
            id: string;
            type: string;
        };
    };
};

type CommandResult = {
    index: number;
    fsa: CommandFsa;
    errors: string[];
};

const GENERATE_THIS_ID = 'GENERATE_THIS_ID';

const APPEND_THIS_ID = 'APPEND_THIS_ID';

const createAdminUserCommand: RegisterUser = {
    aggregateCompositeIdentifier: {
        type: AggregateType.user,
        id: GENERATE_THIS_ID,
    },
    userIdFromAuthProvider: 'auth0|6407b7bd81d69faf23e9dd7e',
    username: 'Cypress McTester',
};

const createAdminUserCommandFsa = {
    type: 'REGISTER_USER',
    payload: createAdminUserCommand,
};

const grantUserRoleCommand: GrantUserRole = {
    aggregateCompositeIdentifier: {
        type: AggregateType.user,
        id: APPEND_THIS_ID,
    },
    role: CoscradUserRole.projectAdmin,
};

const grantUserRoleCommandFsa = {
    type: 'GRANT_USER_ROLE',
    payload: grantUserRoleCommand,
};

const createAdminUserCommandStream = [createAdminUserCommandFsa, grantUserRoleCommandFsa];

@CliCommand({
    name: 'execute-command-stream',
    description: 'executes one or more command FSAs in sequence',
})
export class ExecuteCommandStreamCliCommand extends CliCommandRunner {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(
        _passedParams: string[],
        { name: commandFsas }: { name: CommandFsa[] }
    ): Promise<void> {
        const commandResults: CommandResult[] = [];

        let generatedId: string;

        for (const [index, fsa] of commandFsas.entries()) {
            const shouldGenerateId =
                fsa.payload.aggregateCompositeIdentifier.id === GENERATE_THIS_ID;

            if (shouldGenerateId) generatedId = await this.idManager.generate();

            /**
             * Note that we need a more sophisticated way to deal with generating
             * and appending aggregate context in bulk execution.
             */

            const fsaToExecute = {
                ...fsa,
                payload: {
                    ...fsa.payload,
                    aggregateCompositeIdentifier: {
                        ...fsa.payload.aggregateCompositeIdentifier,
                        id: generatedId,
                    },
                },
            };
            const commandResult = await this.commandHandlerService.execute(fsaToExecute, {
                userId: 'COSCRAD Admin',
            });

            commandResults.push({
                index,
                fsa,
                errors: commandResult instanceof Error ? [commandResult.toString()] : [],
            });
        }

        const failures = commandResults.filter(({ errors }) => errors.length > 0);

        const wasSuccess = failures.length === 0;

        if (!wasSuccess) {
            this.logger.log(`One or more commands failed. \n ${JSON.stringify(failures)}`);

            throw new Error(`Bulk command execution completed but with errors`);
        }
    }

    @CliCommandOption({
        flags: '--name [fixture-name]',
        description: 'the name of the fixture command stream to run',
        // TODO later we can change this to `false` once we allow use of a `json` file or serialized FSAs as input
        required: true,
    })
    parseFixtureName(value: string): CommandFsa[] {
        if (value !== 'users:create-admin') {
            throw new Error(`unrecognized command stream fixture name: ${value}`);
        }

        return createAdminUserCommandStream;
    }
}
