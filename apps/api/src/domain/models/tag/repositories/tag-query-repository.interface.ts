import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
export const TAG_QUERY_REPOSITORY_PROVIDER_TOKEN = 'TAG_QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface ITagQueryRepository extends IResourceQueryRepository<TagViewModel> {
    CreateTag(label: string): Promise<void>;

    // RelabelTag(newLabel: string): Promise<void>;
    // TagResourceOrNote(): Promise<void>;
}
