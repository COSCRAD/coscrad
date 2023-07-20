import { isInteger } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { InternalError } from '../lib/errors/InternalError';
import { IIdRepository } from '../lib/id-generation/interfaces/id-repository.interface';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { ArangoIdRepository } from '../persistence/repositories/arango-id-repository';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

const MAX_QUANTITY_OF_UUIDS_TO_GENERATE = 9999;

interface SeedTestUuidsOptions {
    quantity: number;
}

@CliCommand({
    name: 'seed-test-uuids',
    description: `seeds a number of pseudo-uuids to be used with test data`,
})
export class SeedTestUuids extends CliCommandRunner {
    private readonly idRepository: IIdRepository;

    constructor(
        databaseProvider: ArangoDatabaseProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();

        this.idRepository = new ArangoIdRepository(databaseProvider);
    }

    async run(_passedParams: string[], { quantity }: SeedTestUuidsOptions): Promise<void> {
        const idsToCreate = Array(quantity)
            .fill(null)
            // note that we start indexing sequential IDs at 1
            .map((_, index) => buildDummyUuid(index + 1));

        await this.idRepository.createMany(idsToCreate);

        this.logger.log(`Success.`);
    }

    @CliCommandOption({
        flags: `--quantity [quantity]`,
        description: `the number of UUIDs to generate [between 1 and 1000]`,
        required: true,
    })
    parseQuantity(quantityAsString: string): number {
        const quantityAsNumber = parseFloat(quantityAsString);

        if (!isInteger(quantityAsNumber)) {
            const msg = `Failed to parse quantity. Invalid input. [quantity] must be an integer. Received: ${quantityAsString}`;

            this.logger.log(msg);

            throw new InternalError(msg);
        }

        if (quantityAsNumber < 1) {
            const msg = `Failed to parse quantity. Invalid input. [quantity] must be a non-negative integer. Received: ${quantityAsNumber}`;

            this.logger.log(msg);

            throw new InternalError(msg);
        }

        if (quantityAsNumber > MAX_QUANTITY_OF_UUIDS_TO_GENERATE) {
            const msg = `Failed to parse quantity. Invalid input. [quantity] cannot be bigger than ${MAX_QUANTITY_OF_UUIDS_TO_GENERATE}. Received: ${quantityAsNumber}`;

            this.logger.log(msg);

            throw new InternalError(msg);
        }

        return quantityAsNumber;
    }
}
