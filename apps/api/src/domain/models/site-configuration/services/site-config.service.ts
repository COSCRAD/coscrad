import { Inject } from '@nestjs/common';
import { InternalError } from '../../../lib/errors/InternalError';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN } from './constants';
import { ISiteConfigurationRepository } from '../../repositories/interfaces/site-configuration-repository.interface';

// implement the above with an `ArangoSiteConfigurationRepository`. You don't need to unit test this. The integration test will cover its behaviour.
class SiteConfigurationService {
    constructor(
        @Inject(SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN)
        siteConfigurationRepository: ISiteConfigurationRepository
    ) {}

    create(dto: SiteConfigCreationDto): Promise<DTO<SiteConfig> | InternalError>;

    update(
        partialDto: DeepPartial<SiteConfigCreationDto>
    ): Promise<DTO<SiteConfig | InternalError>>;

    fetch(): Promise<DTO<SiteConfig>>;
}
