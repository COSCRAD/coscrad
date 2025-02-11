import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { VocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';

export const buildTestVocabularyListView = (
    overrides: DeepPartial<DTO<VocabularyListViewModel>>
): VocabularyListViewModel => {
    const defaultDto: DTO<VocabularyListViewModel> = {
        id: buildDummyUuid(1),
        isPublished: false,
        contributions: [],
        name: buildMultilingualTextWithSingleItem('vocab list name (orig)'),
        entries: [],
        accessControlList: {
            allowedGroupIds: [],
            allowedUserIds: [],
        },
        form: {
            fields: [],
        },
        actions: [],
    };

    const dtoToUse = clonePlainObjectWithOverrides(defaultDto, overrides);

    return VocabularyListViewModel.fromDto(dtoToUse);
};
