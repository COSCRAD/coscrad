import {
    ICommandFormAndLabels,
    LanguageCode,
    MIMEType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { buildMultilingualTextFromBilingualText } from '../../../../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { BaseEventSourcedResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/base-event-sourced-resource.view-model';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { Transcript } from '../../shared/entities/transcript.entity';
import { AudioItemCreated } from '../commands/create-audio-item/audio-item-created.event';

@CoscradDataExample<EventSourcedAudioItemViewModel>({
    example: {
        type: ResourceType.audioItem,
        id: buildDummyUuid(3),
        // are we still using this?
        actions: [],
        name: buildMultilingualTextFromBilingualText(
            { text: 'my song', languageCode: LanguageCode.English },
            { text: 'my song (clc)', languageCode: LanguageCode.Chilcotin }
        ),
        mediaItemId: buildDummyUuid(55),
        mimeType: MIMEType.wav,
        lengthMilliseconds: 1234,
        transcript: Transcript.buildEmpty(),
        text: '',
        contributions: [],
        accessControlList: new AccessControlList(),
        isPublished: false,
        tags: [],
    },
})
export class EventSourcedAudioItemViewModel extends BaseEventSourcedResourceViewModel {
    type: ResourceType = ResourceType.audioItem;

    getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }
    actions: ICommandFormAndLabels[];
    mediaItemId: AggregateId;
    mimeType?: MIMEType;
    lengthMilliseconds: number;
    text: string;

    /**
     * TODO Do we want a separate view model for this?
     *
     * TODO update `IAudioItemViewModel` in `api-interfaces`
     */
    transcript?: Transcript;

    constructor(dto: DTO<EventSourcedAudioItemViewModel>) {
        super(dto);

        if (!dto) return;

        const { mediaItemId, accessControlList, isPublished, transcript } = dto;

        this.mediaItemId = mediaItemId;

        /**
         * We need to share this logic. It's not dangerous to have a single
         * `BaseResourceViewModel` class as long as all the properties we
         * put there are essential to the notion of a web-of-knowledge "resource"
         * (view).
         */
        this.accessControlList = isNonEmptyObject(accessControlList)
            ? new AccessControlList(accessControlList)
            : new AccessControlList();

        this.isPublished = isPublished;

        if (isNonEmptyObject(transcript)) {
            this.transcript = new Transcript(transcript);
        } else {
            this.transcript = Transcript.buildEmpty();
        }
    }

    static fromAudioItemCreated({
        payload: {
            aggregateCompositeIdentifier: { id: audioItemId },
            name,
            languageCodeForName,
            mediaItemId,
            lengthMilliseconds,
        },
        meta: { contributorIds: _ },
    }: AudioItemCreated): EventSourcedAudioItemViewModel {
        return new EventSourcedAudioItemViewModel({
            type: ResourceType.audioItem,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            mediaItemId,
            id: audioItemId,
            actions: [],
            // TODO set this
            contributions: [],
            isPublished: false,
            // TODO fix this
            mimeType: MIMEType.wav,
            text: '',
            lengthMilliseconds,
            // in order to grant access, we need a `RESOURCE_READ_ACCESS_GRANTED_TO_USER`
            accessControlList: new AccessControlList(),
            tags: [],
        });
    }

    public static fromDto(dto: DTO<EventSourcedAudioItemViewModel>) {
        return new EventSourcedAudioItemViewModel(dto);
    }
}
