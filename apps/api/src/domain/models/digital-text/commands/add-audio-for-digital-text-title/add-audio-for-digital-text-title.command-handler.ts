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
import { AddAudioForDigitalTextTitle } from './add-audio-for-digital-text-title.command';
import { AudioAddedForDigitalTextTitle } from './audio-added-for-digital-text-title.event';

@CommandHandler(AddAudioForDigitalTextTitle)
export class AddAudioForDigitalTextTitleCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected actOnInstance(
        digitalText: DigitalText,
        { audioItemId, languageCode }: AddAudioForDigitalTextTitle
    ): ResultOrError<DigitalText> {
        const updatedInstance = digitalText.addAudioForTitle(audioItemId, languageCode);

        return updatedInstance;
    }

    protected async fetchRequiredExternalState({
        audioItemId,
    }: AddAudioForDigitalTextTitle): Promise<InMemorySnapshot> {
        const audioItemSearchResult = await this.repositoryProvider
            .forResource<AudioItem>(ResourceType.audioItem)
            .fetchById(audioItemId);

        if (isInternalError(audioItemSearchResult)) {
            throw new InternalError(
                `Encountered an invalid existing audio item when attempting to add audio to a digital text title`,
                [audioItemSearchResult]
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: isNotFound(audioItemSearchResult)
                ? []
                : [audioItemSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: AddAudioForDigitalTextTitle,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new AudioAddedForDigitalTextTitle(payload, eventMeta);
    }
}
