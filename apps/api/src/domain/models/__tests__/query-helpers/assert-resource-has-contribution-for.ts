import { BaseResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base-resource.view-model';
import { CoscradContributor } from '../../user-management/contributor';

export const assertResourceHasContributionFor = (
    dummyContributor: CoscradContributor,
    resource: BaseResourceViewModel
) => {
    const hasContribution = resource.contributions.some(({ contributorIds }) =>
        contributorIds.includes(dummyContributor.id)
    );
    expect(hasContribution).toBe(true);
};
