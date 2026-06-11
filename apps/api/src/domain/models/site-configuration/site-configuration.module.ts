import { Module } from '@nestjs/common';
import { SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN } from './services/constants';
import { PersistenceModule } from '../../persistence/persistence.module';
import { SiteConfigurationController } from '../../app/controllers/site-config.controller';

@Module({
  imports: [PersistenceModule],
  providers: [{
    provide: SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN, // exported from constants
    useClass: ArangoSiteConfigurationRepository
  }],
  controllers: [SiteConfigurationController]
})
class SiteConfigurationModule