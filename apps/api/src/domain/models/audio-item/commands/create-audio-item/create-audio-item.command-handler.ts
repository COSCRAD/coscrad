import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../../lib/types/DomainModelCtor';
import { isNotFound } from '../../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../factories/utilities/buildInstanceFactory';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AudioItem } from '../../entities/audio-item.entity';
import { CreateAudioItem } from './create-audio-item.command';
import { AudioItemCreated } from './transcript-created.event';

@CommandHandler(CreateAudioItem)
export class CreateAudioItemCommandHandler extends BaseCreateCommandHandler<AudioItem> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        name,
        languageCodeForName: languageCode,
        mediaItemId,
        lengthMilliseconds,
    }: CreateAudioItem) {
        const createDto = {
            type: AggregateType.audioItem,
            id,
            name: new MultilingualText({
                items: [
                    new MultilingualTextItem({
                        text: name,
                        languageCode,
                        role: MultilingualTextItemRole.original,
                    }),
                    // To add additional items, run a translate command
                ],
            }),
            mediaItemId,
            lengthMilliseconds,
            published: false,
        };

        return buildInstanceFactory(AudioItem as unknown as DomainModelCtor<AudioItem>)(createDto);

        // WARNING The following introduces circular dependencies.
        // return getInstanceFactoryForResource<AudioItem>(ResourceType.audioItem)(createDto);
    }

    protected async fetchRequiredExternalState({
        mediaItemId,
    }: CreateAudioItem): Promise<InMemorySnapshot> {
        const mediaItemSearchResult = await this.repositoryProvider
            .forResource(AggregateType.mediaItem)
            .fetchById(mediaItemId);

        if (isInternalError(mediaItemSearchResult)) {
            throw new InternalError(
                `Failed to fetch existing state as ${formatAggregateCompositeIdentifier({
                    type: AggregateType.mediaItem,
                    id: mediaItemId,
                })} has invalid state.`,
                [mediaItemSearchResult]
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.mediaItem]: isNotFound(mediaItemSearchResult)
                ? []
                : [mediaItemSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        snapshot: InMemorySnapshot,
        instance: AudioItem
    ): InternalError | Valid {
        return instance.validateExternalReferences(snapshot);
    }

    protected buildEvent(command: CreateAudioItem, eventId: string, userId: string): BaseEvent {
        return new AudioItemCreated(command, eventId, userId);
    }
}
