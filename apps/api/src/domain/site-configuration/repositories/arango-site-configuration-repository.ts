import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseError } from '../../../persistence/database/errors/ArangoDatabaseError';
import mapDatabaseDocumentToAggregateDTO from '../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { AggregateId } from '../../types/AggregateId';
import { SiteConfigCreationDto } from '../models/dtos/site-config-creation-dto';
import { LanguageHubConfig } from '../models/language-hub-config';
import { ISiteConfigurationRepository } from '../site-configuration-repository.interface';

export class ArangoSiteConfigurationRepository implements ISiteConfigurationRepository {
    private readonly database: ArangoDatabaseForCollection<DTO<LanguageHubConfig>>;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'site_configuration'
        );
    }

    async create(siteConfig: LanguageHubConfig): Promise<Maybe<LanguageHubConfig | InternalError>> {
        try {
            await this.database.create(mapEntityDTOToDatabaseDocument(siteConfig.toDTO()));

            return siteConfig;
        } catch (error) {
            if (
                error.message.includes(
                    `unique constraint violated - in index primary of type primary over '_key'`
                )
            ) {
                return new InternalError(
                    `There is already a configuration with the ID: ${siteConfig.id}`
                );
            }

            return new ArangoDatabaseError('failed to create new configuration setting', error);
        }
    }

    async fetchById(siteConfigId: AggregateId): Promise<Maybe<LanguageHubConfig>> {
        const documentSearchResult = await this.database.fetchById(siteConfigId);

        if (isNotFound(documentSearchResult)) {
            return documentSearchResult;
        }

        const dto = mapDatabaseDocumentToAggregateDTO(documentSearchResult);

        return LanguageHubConfig.fromDto(dto);
    }

    async update(id: string, partialDto: DeepPartial<SiteConfigCreationDto>): Promise<void> {
        await this.database.update(id, partialDto);
    }

    async delete(id: string): Promise<void> {
        await this.database.delete(id);
    }
}
