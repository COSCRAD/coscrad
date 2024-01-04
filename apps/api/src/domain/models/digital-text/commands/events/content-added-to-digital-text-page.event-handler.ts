import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { IAggregateRootQueryRepository } from '../../../../../queries/interfaces';
import { ContentAddedToDigitalTextPage } from './content-added-to-digital-text-page.event';

@EventHandler(`CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE`)
export class ContentAddedToDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(`DIGITAL_TEXT_QUERY_REPOSITORY`)
        private readonly digitalTextQueryRepository: IAggregateRootQueryRepository<DigitalTextViewModel>
    ) {}

    async handle(event: ContentAddedToDigitalTextPage): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
            },
        } = event;

        const existingDigitalText = await this.digitalTextQueryRepository.fetchById(id);

        // TODO Log this occurrence
        if (isNotFound(existingDigitalText)) return;

        // TODO Is this really the pattern we want?
        const updatedDigitalText = existingDigitalText.apply(event);

        await this.digitalTextQueryRepository.update(updatedDigitalText);
    }
}
