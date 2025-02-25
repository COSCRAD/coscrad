import { LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextFromBilingualText } from '../../../../common/build-multilingual-text-from-bilingual-text';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';

export const buildTestTermView = (clientDto: DeepPartial<DTO<TermViewModel>>): TermViewModel => {
    const defaultDto: DTO<TermViewModel> = {
        id: buildDummyUuid(1),
        contributions: [
            {
                id: buildDummyUuid(2),
                fullName: 'John Contributor',
            },
            {
                id: buildDummyUuid(3),
                fullName: 'JaneContributor',
            },
        ],
        name: buildMultilingualTextFromBilingualText(
            { languageCode: LanguageCode.Chilcotin, text: 'I am singing (in language)' },
            { languageCode: LanguageCode.English, text: 'I am singing (in English)' }
        ),
        accessControlList: {
            allowedUserIds: [],
            allowedGroupIds: [],
        },
        isPublished: false,
        mediaItemId: buildDummyUuid(4),
        actions: [],
    };

    const dtoToUse = clonePlainObjectWithOverrides(defaultDto, clientDto);

    return TermViewModel.fromDto(dtoToUse);
};
