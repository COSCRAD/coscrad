import { LanguageCode } from '@coscrad/api-interfaces';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { DigitalTextPageImportRecord } from '../commands';

export const DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN =
    'DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN';

/**
 * We will add custom methods to this interface eventually.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDigitalTextQueryRepository
    extends IResourceQueryRepository<DigitalTextViewModel> {
    translateTitle(
        digitalTextId: string,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void>;

    addPage(digitalTextId: string, pageIdentifier: string): Promise<void>;

    addContentToPage(
        digitalTextId: string,
        pageIdentifier: string,
        text: string,
        languageCode: LanguageCode
    ): Promise<void>;

    translatePageContent(
        digitalTextId: string,
        pageIdentifier: string,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void>;

    addAudioToPage(
        digitalTextId: string,
        pageIdentifier: string,
        audioItemId: string,
        languageCode: LanguageCode
    ): Promise<void>;

    addPhotographToPage(
        digitalTextId: string,
        pageIdentifier: string,
        photographId: string
    ): Promise<void>;

    importPages(digitalTextId: string, pages: DigitalTextPageImportRecord[]): Promise<void>;
}
