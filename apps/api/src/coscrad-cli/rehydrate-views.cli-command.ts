import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../domain/common';
import { ICoscradEventPublisher } from '../domain/common/events/interfaces';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { IEventRepository } from '../persistence/repositories/arango-command-repository-for-aggregate-root';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    name: 'rehydrate-views',
    description: 'drop and recreate materialized views from event history',
})
export class RehydrateViewsCliCommand extends CliCommandRunner {
    private readonly eventRepository: IEventRepository;

    constructor(
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: ICoscradEventPublisher,
        private readonly databaseProvider: ArangoDatabaseProvider,
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();

        this.eventRepository = repositoryProvider.getEventRepository();
    }

    async run(_passedParams: string[], _options: unknown): Promise<void> {
        // TODO ensure there are existing views in the test setup
        /**
         * TODO allow the user to select which views to refresh
         * TODO clear views in one operation
         */
        this.logger.log(`clearing existing term views`);

        await this.databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

        this.logger.log('clearing existing audio item views');

        await this.databaseProvider.getDatabaseForCollection('audioItem__VIEWS').clear();

        this.logger.log('clearing existing vocabulary list views');

        await this.databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS').clear();

        const events = await this.eventRepository.fetchEvents();

        this.eventPublisher.publish(events);
    }
}
