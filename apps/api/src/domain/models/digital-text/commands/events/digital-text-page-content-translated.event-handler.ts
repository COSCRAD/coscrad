import { Inject } from '@nestjs/common';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { IAggregateRootQueryRepository } from '../../../../../queries/interfaces';
import { DigitalTextPageContentTranslated } from './digital-text-page-content-translated.event';

export class DigitalTextPageContentTranslatedEventHandler {
    constructor(
        @Inject(`DIGITAL_TEXT_QUERY_REPOSITORY`)
        private readonly digitalTextQueryRepository: IAggregateRootQueryRepository<DigitalTextViewModel>
    ) {}

    async handle(event: DigitalTextPageContentTranslated): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                pageIdentifier,
                translation,
                languageCode,
            },
        } = event;

        const existingDigitalText = await this.digitalTextQueryRepository.fetchById(id);

        // TODO Log
        if (isNotFound(existingDigitalText)) return;

        const targetPage = existingDigitalText.pages.find(
            (page) => page.identifier === pageIdentifier
        );

        if (!targetPage) return;

        const pageUpdateResult = targetPage.translateContent(translation, languageCode);

        if (isInternalError(pageUpdateResult)) {
            return;
        }

        const updatedPages = existingDigitalText.pages.map((page) =>
            page.identifier === id ? pageUpdateResult : page
        );

        this.digitalTextQueryRepository.update({
            id,
            pages: updatedPages,
        });
    }
}
