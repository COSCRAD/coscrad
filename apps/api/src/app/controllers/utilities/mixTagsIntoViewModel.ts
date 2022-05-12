import { isDeepStrictEqual } from 'util';
import { ResourceTypeOrNoteType } from '../../../domain/models/categories/types/ResourceTypeOrNoteType';
import { Tag } from '../../../domain/models/tag/tag.entity';
import { TagViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../../view-models/buildViewModelForResource/viewModels/base.view-model';

export default (
    viewModel: BaseViewModel,
    allTags: Tag[],
    type: ResourceTypeOrNoteType
): BaseViewModel & { tags: TagViewModel[] } => {
    const tagsForThisModel = allTags
        .filter(({ members }) =>
            members.some((member) =>
                isDeepStrictEqual(member, {
                    type: type,
                    id: viewModel.id,
                })
            )
        )
        .map((tag) => new TagViewModel(tag));

    return {
        ...viewModel,
        tags: tagsForThisModel,
    };
};
