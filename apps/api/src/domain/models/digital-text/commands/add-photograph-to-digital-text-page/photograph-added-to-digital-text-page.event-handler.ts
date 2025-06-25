import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEvent, ICoscradEventHandler } from '../../../../common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { AddPhotographToDigitalTextPage } from './add-photograph-to-digital-text-page.command';

@CoscradEventConsumer('PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE')
export class PhotographAddedToDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly digitalTextRepository: IDigitalTextQueryRepository
    ) {}

    async handle(event: ICoscradEvent): Promise<void> {
        const {
            aggregateCompositeIdentifier: { id: digitalTextId },
            pageIdentifier,
            photographId,
        } = event.payload as AddPhotographToDigitalTextPage;

        await this.digitalTextRepository.addPhotographToPage(
            digitalTextId,
            pageIdentifier,
            photographId
        );
    }
}
