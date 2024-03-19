import { AggregateCompositeIdentifier, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { FullName } from '../../../user/entities/user/full-name.entity';
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

    @NestedDataType(FullName, {
        label: 'full name',
        description: "The Contributor's Full Name",
    })
    readonly fullName: FullName;

    @NestedDataType(CoscradDate, {
        label: 'date of birth',
        description: "The Contributor's Date of Birth",
    })
    readonly dateOfBirth: CoscradDate;
}
