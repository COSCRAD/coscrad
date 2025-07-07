import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { CoverPhotographAddedForDigitalText } from './cover-photograph-added-for-digital-text.event';

@CoscradEventConsumer('COVER_PHOTOGRAPH_ADDED_FOR_DIGITAL_TEXT')
export class CoverPhotographAddedForDigitalTextEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly digitalTextRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            photographId,
        },
    }: CoverPhotographAddedForDigitalText): Promise<void> {
        await this.digitalTextRepository.addCoverPhotograph(digitalTextId, photographId);
    }
}
