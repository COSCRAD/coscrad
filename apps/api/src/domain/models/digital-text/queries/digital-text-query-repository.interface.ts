import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { DigitalTextViewModel } from '../../../../queries/digital-text';

export const DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN =
    'DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN';

/**
 * We will add custom methods to this interface eventually.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDigitalTextQueryRepository
    extends IResourceQueryRepository<DigitalTextViewModel> {}
