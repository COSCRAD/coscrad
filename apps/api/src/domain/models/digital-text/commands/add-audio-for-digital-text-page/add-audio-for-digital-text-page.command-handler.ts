import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { AudioItem } from '../../../audio-item/entities/audio-item.entity';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

@CommandHandler(AddAudioForDigitalTextPage)
export class AddAudioForDigitalTextPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected actOnInstance(
        digitalText: DigitalText,
        { audioItemId, pageIdentifier, languageCode }: AddAudioForDigitalTextPage
    ): ResultOrError<DigitalText> {
        const updatedInstance = digitalText.addAudioForPage(
            pageIdentifier,
            audioItemId,
            languageCode
        );

        return updatedInstance;
    }

    protected async fetchRequiredExternalState({
        audioItemId,
    }: AddAudioForDigitalTextPage): Promise<InMemorySnapshot> {
        const audioItemSearchResult = await this.repositoryProvider
            .forResource<AudioItem>(ResourceType.audioItem)
            // use `fetchById` to avoid sending all audio items from database
            .fetchById(audioItemId);

        if (isInternalError(audioItemSearchResult)) {
            throw new InternalError(
                `Encountered an invalid existing audio item when attempting to add audio to a digital text page`,
                [audioItemSearchResult]
            );
        }

        // no external state required
        return Promise.resolve(
            new DeluxeInMemoryStore({
                // we send back just the target audio item if it is found for efficiency
                [AggregateType.audioItem]: isNotFound(audioItemSearchResult)
                    ? []
                    : [audioItemSearchResult],
            }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddAudioForDigitalTextPage,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new AudioAddedForDigitalTextPage(command, eventMeta);
    }
}
