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
import { VideoCreated } from '../commands';

@CoscradDataExample<EventSourcedVideoViewModel>({
    example: {
        type: ResourceType.video,
        id: buildDummyUuid(6),
        actions: [],
        name: buildMultilingualTextFromBilingualText(
            { text: 'my video', languageCode: LanguageCode.English },
            { text: 'my video (clc)', languageCode: LanguageCode.Chilcotin }
        ),
        mediaItemId: buildDummyUuid(54),
        mimeType: MIMEType.mp4,
        lengthMilliseconds: 432120,
        transcript: Transcript.buildEmpty(),
        text: '',
        contributions: [],
        accessControlList: new AccessControlList(),
        isPublished: false,
        tags: [],
    },
})
export class EventSourcedVideoViewModel extends BaseEventSourcedResourceViewModel {
    // TODO be sure they are all read only
    readonly type = ResourceType.video;

    getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }
    actions: ICommandFormAndLabels[];
    mediaItemId: AggregateId;
    mimeType?: MIMEType;
    lengthMilliseconds: number;
    text: string;
    transcript?: Transcript;

    constructor(dto: DTO<EventSourcedVideoViewModel>) {
        super(dto);

        if (!dto) return;

        const { mediaItemId, transcript } = dto;

        this.mediaItemId = mediaItemId;

        if (isNonEmptyObject(transcript)) {
            this.transcript = new Transcript(transcript);
        }
    }

    static fromVideoCreated({
        payload: {
            aggregateCompositeIdentifier: { id: videoId },
            name,
            languageCodeForName,
            mediaItemId,
            lengthMilliseconds,
        },
        // note that attribution must be joined separately at the event consumer level
        meta: { contributorIds: _ },
    }: VideoCreated): EventSourcedVideoViewModel {
        return new EventSourcedVideoViewModel({
            type: ResourceType.video,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            mediaItemId,
            id: videoId,
            actions: [],
            contributions: [],
            isPublished: false,
            mimeType: MIMEType.mp4,
            text: '',
            lengthMilliseconds,
            // in order to grant access, we need a `RESOURCE_READ_ACCESS_GRANTED_TO_USER`
            accessControlList: new AccessControlList(),
            tags: [],
        });
    }

    public static fromDto(dto: DTO<EventSourcedVideoViewModel>) {
        return new EventSourcedVideoViewModel(dto);
    }
}
