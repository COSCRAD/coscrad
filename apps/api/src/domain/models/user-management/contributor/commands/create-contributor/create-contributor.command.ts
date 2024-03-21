import { AggregateCompositeIdentifier, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { CoscradDate } from '../../../utilities';
import { ContributorCompositeIdentifier } from '../contributor-composite-identifier';

@Command({
    type: 'CREATE_CONTRIBUTOR',
    label: 'Create Contributor',
    description: 'Create a new COSCRAD contributor',
})
export class CreateContributor implements ICommandBase {
    @NestedDataType(ContributorCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: "the contributor's first name",
        description: "The Contributor's first name",
    })
    readonly firstName: string;

    @NonEmptyString({
        label: "the contributor's last name",
        description: "The Contributor's last name",
    })
    readonly lastName: string;

    @NestedDataType(CoscradDate, {
        label: 'date of birth',
        description: "The Contributor's Date of Birth",
    })
    readonly dateOfBirth?: CoscradDate;
}
