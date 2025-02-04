import { AggregateType, ContributorWithId } from '@coscrad/api-interfaces';
import { NonEmptyString } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import idEquals from '../../../domain/models/shared/functional/idEquals';
import { CoscradContributor } from '../../../domain/models/user-management/contributor';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { InternalError } from '../../../lib/errors/InternalError';
import { BaseViewModel, Nameable } from './base.view-model';
import { HasViewModelId } from './types/ViewModelId';

interface Accreditable {
    getContributions(): { contributorId: string; eventType: string; date: number }[];
}

export class BaseResourceViewModel
    extends BaseViewModel
    implements HasAggregateId, DetailScopedCommandWriteContext
{
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

    /**
     * Note that for state-based models, we should really move the logic to the
     * view model instead of the domain model. For event sourced models, this
     * is already done. For now, we side-step the need for a sweeping refactor.
     */
    getAvailableCommands(): string[] {
        throw new Error(`Not Implemented: Did you mean to project off the event-sourced view?`);
    }

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        throw new InternalError(`Not Implemented. Use event-sourced views.`);
    }
}
