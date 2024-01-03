import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { IAggregateRootQueryRepository } from '../../../../../queries/interfaces';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

@EventHandler(`AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`)
export class AudioAddedForDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(`DIGITAL_TEXT_QUERY_REPOSITORY`)
        private readonly digitalTextQueryRepository: IAggregateRootQueryRepository<DigitalTextViewModel>
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            audioItemId,
            languageCode,
        },
    }: AudioAddedForDigitalTextPage): Promise<void> {
        /**
         * It's possible that we can actually just do the update without ever
         * fetching. At some point, we should measure the performance of this.
         * For example, we could have
         * this.digitalTextRepository.insertItemIntoArray('audio.items',{
         *     languageCode,
         *     audioItemId
         * })
         */
        const existingDigitalText = await this.digitalTextQueryRepository.fetchById(id);

        // Once we use a messaging queue, we can fail with an exception. For now, we don't want to interrupt the synchronous thread.
        if (isNotFound(existingDigitalText)) return;

        /**
         * TODO Shouldn't we keep a denormalized view of the audio item here?
         * What does that look like?
         */
        const updatedAudio = existingDigitalText.audio.addAudio(audioItemId, languageCode);

        // ignore invalid updates to audio
        if (isInternalError(updatedAudio)) return;

        // We should append the applied event as well
        await this.digitalTextQueryRepository.update({
            id,
            audio: updatedAudio,
        });
    }
}
