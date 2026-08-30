import { Inject } from '@nestjs/common';
import { CoscradInvalidUserInputException } from '../../../app/controllers/response-mapping/CoscradExceptions';
import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { IIdManager } from '../../interfaces/id-manager.interface';
import { AggregateId } from '../../types/AggregateId';
import { SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN } from '../constants';
import { SiteConfigCreationDto } from '../models/dtos/site-config-creation-dto';
import { LanguageHubConfig } from '../models/language-hub-config';
import { ISiteConfigurationRepository } from '../site-configuration-repository.interface';

// implement the above with an `ArangoSiteConfigurationRepository`. You don't need to unit test this. The integration test will cover its behaviour.
export class SiteConfigurationService {
    constructor(
        @Inject(SITE_CONFIGURATION_REPOSITORY_INJECTION_TOKEN)
        private readonly idManager: IIdManager,
        private readonly siteConfigurationRepository: ISiteConfigurationRepository
    ) {}

    async create(
        dto: SiteConfigCreationDto
    ): Promise<AggregateId | CoscradInvalidUserInputException> {
        const id = await this.idManager.generate();

        const languageHubConfig = LanguageHubConfig.fromCreationDto(id, dto);

        const validationResult = languageHubConfig.validateInvariants();

        if (validationResult.length > 0) {
            return new CoscradInvalidUserInputException(
                new InternalError(
                    `Failed to create memory match round: ${dto.name}.`,
                    validationResult
                )
            );
        }
    }

    async update(id: AggregateId, partialDto: DeepPartial<DTO<LanguageHubConfig>>): Promise<void> {
        await this.siteConfigurationRepository.update(id, partialDto);
    }

    async fetchById(id: AggregateId): Promise<Maybe<LanguageHubConfig>> {
        const searchResult = await this.siteConfigurationRepository.fetchById(id);

        if (isNotFound(searchResult)) {
            return NotFound;
        }

        return searchResult;
    }
}
