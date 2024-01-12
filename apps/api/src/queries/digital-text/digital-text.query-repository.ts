import { AggregateType, IDigitalTextViewModel } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'node:util';
import { Maybe } from '../../lib/types/maybe';
import { NotFound } from '../../lib/types/not-found';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import { IAggregateRootQueryRepository } from '../interfaces';
import { DigitalTextViewModel } from './digital-text.view-model';

/**
 * TODO Generalize this for any aggregate root.
 */
export class DigitalTextQueryRepository
    implements IAggregateRootQueryRepository<IDigitalTextViewModel>
{
    constructor(private readonly eventRepository: ArangoEventRepository) {}

    public async fetchById(id: string): Promise<Maybe<DigitalTextViewModel>> {
        const fullEventHistory = await this.eventRepository.fetchEvents();

        const eventHistoryForThisDigitalText = fullEventHistory.filter(
            ({ payload: { aggregateCompositeIdentifier } }) =>
                isDeepStrictEqual(aggregateCompositeIdentifier, this.buildCompositeIdentifier(id))
        );

        if (eventHistoryForThisDigitalText.length === 0) return NotFound;

        /**
         * Note that we require the entire event history in order to denormalize
         * the query models. We may want to determine things like
         * - which tags apply to this resource
         * - which other resources is this resource connected to
         * - which categories apply to this resource
         */
        const hydratedViewModel = new DigitalTextViewModel(id).applyStream(fullEventHistory);

        return hydratedViewModel;
    }

    public async fetchMany(): Promise<DigitalTextViewModel[]> {
        const fullEventHistory = await this.eventRepository.fetchEvents();

        const allIdsWithDuplicates = fullEventHistory
            .filter(
                (event) =>
                    event?.payload?.aggregateCompositeIdentifier?.type === AggregateType.digitalText
            )
            .map(
                ({
                    payload: {
                        aggregateCompositeIdentifier: { id },
                    },
                }) => id
            );

        const digitalTextIds = [...new Set(allIdsWithDuplicates)];

        const hydratedViewModels = digitalTextIds.map((id) =>
            new DigitalTextViewModel(id).applyStream(fullEventHistory)
        );

        return hydratedViewModels;
    }

    private buildCompositeIdentifier(id: string) {
        return {
            type: AggregateType.digitalText,
            id,
        };
    }
}
