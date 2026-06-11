import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { DeepPartial } from '../../types/DeepPartial';
import { SiteConfigCreationDto } from './models/dtos/site-config-creation-dto';
import { LanguageHubConfig } from './models/language-hub-config';

export interface ISiteConfigurationRepository {
    create(dto: SiteConfigCreationDto): Promise<Maybe<LanguageHubConfig | InternalError>>;

    fetchById(id: string): Promise<Maybe<LanguageHubConfig>>;

    update(id: string, partialDto: DeepPartial<SiteConfigCreationDto>): Promise<void>;

    delete(id: string): Promise<void>;
}
