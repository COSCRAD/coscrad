import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { IAggregateRootQueryRepository } from '../../../../../queries/interfaces';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { PageAddedToDigitalText } from './page-added-to-digital-text.event';

@EventHandler(`PAGE_ADDED_TO_DIGITAL_TEXT`)
export class PageAddedToDigitalTextEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(`DIGITAL_TEXT_QUERY_REPOSITORY`)
        private readonly digitalTextQueryRepository: IAggregateRootQueryRepository<DigitalTextViewModel>
    ) {}

    async handle(event: PageAddedToDigitalText): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                identifier,
            },
        } = event;

        const existingDigitalText = await this.digitalTextQueryRepository.fetchById(id);

        // TODO Log
        if (isNotFound(existingDigitalText)) return;

        await this.digitalTextQueryRepository.update({
            id,
            pages: existingDigitalText.pages.concat(
                new DigitalTextPage({
                    identifier,
                    audio: new MultilingualAudio({
                        items: [],
                    }),
                })
            ),
        });
    }
}
