import { Module } from '@nestjs/common';
import { SiteConfigurationController } from '../../app/controllers/site-config.controller';
import { PersistenceModule } from '../../persistence/persistence.module';
import { SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN } from './constants';
import { ArangoSiteConfigurationRepository } from './repositories/arango-site-configuration-repository';

@Module({
    imports: [PersistenceModule],
    providers: [
        {
            provide: SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN, // exported from constants
            useClass: ArangoSiteConfigurationRepository,
        },
    ],
    controllers: [SiteConfigurationController],
})
class SiteConfigurationModule {}
