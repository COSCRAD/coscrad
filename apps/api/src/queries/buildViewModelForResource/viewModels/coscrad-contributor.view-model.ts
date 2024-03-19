import { ICoscradContributorViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, NonEmptyString } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { CoscradContributor } from '../../../domain/models/user-management/contributor/entities/coscrad-contributor.entity';
import { BaseViewModel } from './base.view-model';

const FromContributor = FromDomainModel(CoscradContributor);

// TODO Annotate this as a COSCRAD canonical view
export class CoscradContributorViewModel
    extends BaseViewModel
    implements ICoscradContributorViewModel
{
    @NonEmptyString({
        label: 'full name',
        description: 'full name of the contributor',
    })
    fullName: string;

    @FromContributor
    shortBio?: string;

    constructor(contributor: CoscradContributor) {
        super(contributor);

        const { shortBio } = contributor;

        if (!isNullOrUndefined(shortBio)) {
            this.shortBio = shortBio;
        }

        this.fullName = contributor.getName().getOriginalTextItem().text;
    }
}
