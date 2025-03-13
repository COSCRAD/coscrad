import { NonEmptyString } from '@coscrad/data-types';

/**
 * Note that this is not the "canonical view" for a contributor. Rather, this is
 * the view that is used when joining (eagerly in the vent consumers) contribution
 * info into resource views.
 */
export class ContributionSummary {
    @NonEmptyString({
        label: 'contributor ID',
        description: 'ID of person who contributed to the creation or editing of this resource',
    })
    id: string;

    @NonEmptyString({
        label: 'full name',
        description: 'the first and last name of the contributor',
    })
    fullName: string;
}
