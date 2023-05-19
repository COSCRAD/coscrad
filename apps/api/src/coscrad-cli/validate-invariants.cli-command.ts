import { Inject } from '@nestjs/common';
import { InternalError } from '../lib/errors/InternalError';
import { DomainDataExporter } from '../persistence/repositories/domain-data-exporter';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    description: `reports invariant validation for all aggregate root instances`,
    name: `validate-invariants`,
})
export class ValidateInvariantsCliCommand extends CliCommandRunner {
    constructor(
        private readonly domainDataExporter: DomainDataExporter,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(): Promise<void> {
        this.logger.log(`Validating invariants (entire database state)`);

        const allErrors = await this.domainDataExporter.validateAllInvariants();

        if (allErrors.length === 0) {
            this.logger.log(`no errors found`);
            return;
        }

        this.logger.log(
            `Found the following errors:\n`.concat(
                new InternalError(`Encountered invalid database state`, allErrors).toString()
            )
        );
    }
}
