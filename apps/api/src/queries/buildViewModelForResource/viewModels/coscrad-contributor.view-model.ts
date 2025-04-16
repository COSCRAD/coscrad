import { AggregateType, ICoscradContributorViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, NonEmptyString } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { CoscradContributor } from '../../../domain/models/user-management/contributor/entities/coscrad-contributor.entity';
import { FullName } from '../../../domain/models/user-management/user/entities/user/full-name.entity';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { BaseViewModel } from './base.view-model';

const FromContributor = FromDomainModel(CoscradContributor);

// TODO Annotate this as a COSCRAD canonical view
@CoscradDataExample<CoscradContributorViewModel>({
    example: {
        id: buildDummyUuid(123),
        name: buildMultilingualTextWithSingleItem('Oscar Myers'),
        fullName: new FullName({
            firstName: 'Oscar',
            lastName: 'Myers',
        }).toString(),
    },
})
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
        if (!contributor) return;

        super(contributor);

        const { shortBio } = contributor;

        if (!isNullOrUndefined(shortBio)) {
            this.shortBio = shortBio;
        }

        this.fullName = contributor.getName().getOriginalTextItem().text;
    }

    public static fromDto(dto: DTO<CoscradContributorViewModel>): CoscradContributorViewModel {
        /**
         * This is a hack. We need to decide how to handle materialized views
         * for state-based (not event sourced) models.
         */
        if (!dto) return new CoscradContributorViewModel(undefined);

        const [firstName, lastName] = dto.fullName.split(' ');

        return new CoscradContributorViewModel(
            new CoscradContributor({
                id: dto.id,
                type: AggregateType.contributor,
                fullName: new FullName({
                    firstName,
                    lastName,
                }),
            })
        );
    }
}
