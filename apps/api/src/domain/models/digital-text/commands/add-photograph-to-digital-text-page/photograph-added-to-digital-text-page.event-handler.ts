import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { PhotographAddedToDigitalTextPage } from './photograph-added-to-digital-text-page.event';

@CoscradEventConsumer('PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE')
export class PhotographAddedToDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly digitalTextRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            pageIdentifier,
            photographId,
        },
    }: PhotographAddedToDigitalTextPage): Promise<void> {
        await this.digitalTextRepository.addPhotographToPage(
            digitalTextId,
            pageIdentifier,
            photographId
        );
    }
}
