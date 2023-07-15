import { Ack, CommandHandlerService } from '@coscrad/commands';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { InternalError } from '../lib/errors/InternalError';
import { buildTestCommandFsaMap } from '../test-data/commands';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

interface SeedTestDataWithCommandOptions {
    type: string;
    payloadOverrides?: Record<string, unknown>;
}

const fsaMap = buildTestCommandFsaMap();

@CliCommand({
    name: 'seed-test-data-with-command',
    description: 'executes a fixture command (by type) with optional overrides to seed test data',
})
export class SeedTestDataWithCommand extends CliCommandRunner {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(_passedParams: string[], options: SeedTestDataWithCommandOptions): Promise<void> {
        const { type: commandType, payloadOverrides } = options;

        if (!fsaMap.has(commandType)) {
            this.logger.log(`failed to find a fixture command of type: ${commandType}. Exiting.`);

            throw new InternalError(`No fixture command of type: ${commandType} found`);
        }

        const testFsa = fsaMap.get(commandType);

        const { payload: defaultPayload } = testFsa;

        const fsaToWithOverrides = {
            type: commandType,
            payload: {
                ...defaultPayload,
                ...(payloadOverrides || {}),
            },
        };

        this.logger.log(`attempting to execute FSA: ${JSON.stringify(fsaToWithOverrides)}`);

        /**
         * TODO We need to do this conditionally, only for create commands. For
         * this reason, it is better if this logic gets moved to a special method
         * on the command handler or a similar service. We don't want this logic
         * in the CLI command controller in case we need to expose it via some
         * other transport layer.
         */
        const generatedId = await this.idManager.generate();

        const { payload: payloadWithoutGeneratedId } = fsaToWithOverrides;

        const fsaToExecute = {
            ...fsaToWithOverrides,
            payload: {
                ...payloadWithoutGeneratedId,
                aggregateCompositeIdentifier: {
                    ...payloadWithoutGeneratedId.aggregateCompositeIdentifier,
                    id: generatedId,
                },
            },
        };

        const result = await this.commandHandlerService.execute(fsaToExecute, {
            // TODO Assign the following to a constant
            // Do we want to allow the admin user to provide a user ID here?
            userId: `COSCRAD_ADMIN`,
        });

        if (result === Ack) {
            this.logger.log(`success`);

            return;
        }

        const msg = `The command failed with the following errors: ${result.toString()}`;

        this.logger.log(msg);

        throw new InternalError(msg);
    }

    @CliCommandOption({
        flags: '--type [commandType]',
        description: 'the type of the command to execute',
        required: true,
    })
    parseCommandType(value: string): string {
        if (!isNonEmptyString(value)) {
            throw new InternalError(`parameter: type must be a non-empty string`);
        }

        return value;
    }

    @CliCommandOption({
        flags: '--payload-overrides [payloadOverrides]',
        description:
            'serialized object with overrides to the default staging command payload of this type',
        required: false,
    })
    parsePayloadOverrides(value?: string): Record<string, unknown> {
        // If an empty string is passed or this parameter is omitted, there are no overrides
        if (!isNonEmptyString(value)) return {};

        try {
            const parsed = JSON.parse(value);

            return parsed;
        } catch (error) {
            const msg = `Failed to parse [payload-overrides] `.concat(
                error?.message ? `: ${error.message}` : ''
            );

            this.logger.log(msg);

            throw new InternalError(msg);
        }
    }
}
