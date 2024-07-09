import { ContributorWithId } from '@coscrad/api-interfaces';
import { NonEmptyString } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import idEquals from '../../../domain/models/shared/functional/idEquals';
import { CoscradContributor } from '../../../domain/models/user-management/contributor';
import { BaseViewModel, Nameable } from './base.view-model';
import { HasViewModelId } from './types/ViewModelId';

interface Accreditable {
    getContributions(): { contributorId: string; eventType: string; date: number }[];
}

export class BaseResourceViewModel extends BaseViewModel {
    @NonEmptyString({
        label: `contributions`,
        description: `list of knowledge keepers who contributed this song`,
        isArray: true,
    })
    readonly contributions: ContributorWithId[];

    constructor(
        domainModel: HasViewModelId & Nameable & Accreditable,
        contributors: CoscradContributor[]
    ) {
        super(domainModel);

        const contributionsWithDuplicates = domainModel
            .getContributions()
            .map(({ contributorId }) => contributors.find(idEquals(contributorId)))
            .filter((contributor) => !isNullOrUndefined(contributor))
            .map(({ id, fullName }) => ({ id: id, fullName: fullName.toString() }));

        this.contributions = [...new Set(contributionsWithDuplicates)];
    }
}
