import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { IAggregateRootQueryRepository } from '../../../../../queries/interfaces';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { DigitalTextCreated } from './digital-text-created.event';

@EventHandler(`DIGITAL_TEXT_CREATED`)
export class DigitalTextCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(`DIGITAL_TEXT_QUERY_REPOSITORY`)
        private readonly digitalTextQueryRepository: IAggregateRootQueryRepository<DigitalTextViewModel>
    ) {}

    async handle(event: DigitalTextCreated): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                title: titleText,
                languageCodeForTitle,
            },
        } = event;

        const title = buildMultilingualTextWithSingleItem(titleText, languageCodeForTitle);

        const newDigitalText = DigitalTextViewModel.fromSnapshot({
            id,
            name: title,
            title: title,
            pages: [],
            tags: [],
            isPublished: false,
            audio: new MultilingualAudio({
                items: [],
            }),
        });

        await this.digitalTextQueryRepository.create(newDigitalText);
    }
}
