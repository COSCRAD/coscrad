import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../command-handlers/base-update-command-handler';
import InvalidExternalStateError from '../../common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../../events/base-event.entity';
import { EventRecordMetadata } from '../../events/types/EventRecordMetadata';
import idEquals from '../../functional/idEquals';
import { AdditionalCreditsProvidedForResource } from './additional-credits-provided-for-resource.event';
import { ProvideAdditionalCreditsForResource } from './provide-additional-credits-for-resource.command';

@CommandHandler(ProvideAdditionalCreditsForResource)
export class ProvideAdditionalCreditsForResourceCommandHandler extends BaseUpdateCommandHandler<Resource> {
    protected async fetchRequiredExternalState({
        contributorIds,
    }: ProvideAdditionalCreditsForResource): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .getContributorRepository()
            .fetchMultipleById(contributorIds);

        return Promise.resolve(
            new DeluxeInMemoryStore({
                contributor: searchResult,
            }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected actOnInstance(
        instance: Resource,
        { contributionType, contributorIds }: ProvideAdditionalCreditsForResource
    ): ResultOrError<Resource> {
        const updated = instance.provideAdditionalCredits({
            type: contributionType,
            contributorIds,
        });

        return updated;
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: Resource
    ): Valid | InternalError {
        const { contributor: allContributors } = state;

        const { manualCredits } = instance;

        const missingCredits = manualCredits.flatMap(({ contributorIds }) => {
            return contributorIds.filter((id) => !allContributors.some(idEquals(id)));
        });

        if (missingCredits.length === 0) {
            return Valid;
        }

        return new InvalidExternalStateError(
            missingCredits.map(
                (contributorId) =>
                    new InternalError(
                        `Encountered a manually registered contributor (${contributorId}) for ${formatAggregateCompositeIdentifier(
                            instance.getCompositeIdentifier()
                        )}`
                    )
            )
        );
    }

    protected buildEvent(
        payload: ProvideAdditionalCreditsForResource,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new AdditionalCreditsProvidedForResource(payload, eventMeta);
    }
}
