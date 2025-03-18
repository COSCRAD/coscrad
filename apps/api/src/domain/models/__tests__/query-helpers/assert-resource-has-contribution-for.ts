import { BaseResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base-resource.view-model';
import { CoscradContributor } from '../../user-management/contributor';

export const assertResourceHasContributionFor = (
    dummyContributor: CoscradContributor,
    resource: BaseResourceViewModel
) => {
    const hasContribution = resource.contributions.some(
        ({ fullName: foundFullName, id: foundContributorId }) =>
            foundFullName === dummyContributor.fullName.toString() &&
            foundContributorId === dummyContributor.id
    );

    expect(hasContribution).toBe(true);
};
