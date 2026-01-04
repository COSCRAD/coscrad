import { AggregateType } from '@coscrad/api-interfaces';
import { NonEmptyString } from '@coscrad/data-types';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import idEquals from '../../../domain/models/shared/functional/idEquals';
import { CoscradContributor } from '../../../domain/models/user-management/contributor';
import { ContributionSummary } from '../../../domain/models/user-management/contributor/views/contribution-summary.view-model';
import { CoscradDate } from '../../../domain/models/user-management/utilities';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import capitalizeFirstLetter from '../../../lib/utilities/strings/capitalizeFirstLetter';
import { BaseViewModel, Nameable } from './base.view-model';
import { NoteRecordForResourceViewModel } from './note-record-for-resource.view-model';
import { HasViewModelId } from './types/ViewModelId';

interface Accreditable {
    getContributions(): {
        type: string;
        contributorIds: string[];
        date: number;
    }[];
}

/**
 * We used to project view models off the domain state. This was inefficient
 * due to requiring extensive in-memory joins and sending large amounts of
 * external state from the db.
 *
 * We now eagerly build materialized views in a separate query database (full CQRS pattern).
 *
 * The one benefit of the old pattern is that you have strong consistency. The
 * query DB is eventually consistent. If there is ever a case where a report (e.g. audit report)
 * is required to have this level of accuracy, you should project off the domain
 * (event stream or domain snapshots) directly.
 */
export class BaseDomainProjectionResourceViewModel
    extends BaseViewModel
    implements HasAggregateId, DetailScopedCommandWriteContext
{
    @NonEmptyString({
        label: `contributions`,
        description: `list of knowledge keepers who contributed this song`,
        isArray: true,
    })
    readonly contributions: ContributionSummary[];

    /**
     * TODO We need to leverage a query DB for bibliographic citations.
     * TODO We need to leverage a query DB for videos.
     *
     * For now, `videos` and `bibliographic citations` will come back with no notes.
     */
    readonly notes: Record<string, NoteRecordForResourceViewModel> = {};

    constructor(
        domainModel: HasViewModelId & Nameable & Accreditable,
        contributors: CoscradContributor[]
    ) {
        super(domainModel);

        const contributionsFromDomainModel = domainModel.getContributions();

        const contributorsMap = contributionsFromDomainModel
            .flatMap(({ contributorIds }) => contributorIds)
            .reduce(
                (acc, contributorId) =>
                    acc.has(contributorId)
                        ? acc
                        : acc.set(contributorId, contributors.find(idEquals(contributorId))),
                new Map<string, CoscradContributor>()
            );

        const joinedContributions = contributionsFromDomainModel.map(
            ({ contributorIds, type: eventType, date: timestamp }) => {
                const coscradDate = CoscradDate.fromUnixTimestamp(timestamp);

                if (isInternalError(coscradDate)) {
                    throw new InternalError(
                        `Encountered an invalid timestamp in the database: ${timestamp}`
                    );
                }

                const contributorNames =
                    contributorIds.length === 0
                        ? 'admin'
                        : contributorIds
                              .map((id) => contributorsMap.get(id).fullName.toString())
                              .join(', ');

                const statement = `${capitalizeFirstLetter(
                    eventType.split('_').join(' ').toLocaleLowerCase()
                )} by: ${contributorNames}`;

                return new ContributionSummary({
                    type: eventType,
                    contributorIds,
                    timestamp,
                    date: coscradDate,
                    statement,
                });
            }
        );

        this.contributions = joinedContributions;
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
