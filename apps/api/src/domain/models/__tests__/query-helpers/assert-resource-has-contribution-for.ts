import { BaseDomainProjectionResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base-domain-projection-resource.view-model';
import { CoscradContributor } from '../../user-management/contributor';

export const assertResourceHasContributionFor = (
    dummyContributor: CoscradContributor,
    resource: BaseDomainProjectionResourceViewModel
) => {
    const hasContribution = resource.contributions.some(({ contributorIds }) =>
        contributorIds.includes(dummyContributor.id)
    );
    expect(hasContribution).toBe(true);
};
