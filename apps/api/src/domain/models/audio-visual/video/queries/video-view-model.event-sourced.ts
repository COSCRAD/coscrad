import {
    ContributorWithId,
    ICommandFormAndLabels,
    LanguageCode,
    MIMEType,
} from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { buildMultilingualTextFromBilingualText } from '../../../../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { Transcript } from '../../shared/entities/transcript.entity';
import { VideoCreated } from '../commands';

@CoscradDataExample<EventSourcedVideoViewModel>({
    example: {
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
    },
})
export class EventSourcedVideoViewModel {
    actions: ICommandFormAndLabels[];
    name: MultilingualText;
    mediaItemId: AggregateId;
    mimeType?: MIMEType;
    lengthMilliseconds: number;
    text: string;
    contributions: ContributorWithId[];
    id: string;
    accessControlList: AccessControlList;
    isPublished: boolean;
    transcript?: Transcript;

    constructor(dto: DTO<EventSourcedVideoViewModel>) {
        if (!dto) return;

        const { id, name, contributions, mediaItemId, accessControlList, isPublished, transcript } =
            dto;

        this.id = id;

        this.name = new MultilingualText(name);

        // do we need to clone?
        this.contributions = Array.isArray(contributions) ? contributions : [];

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
        });
    }

    public static fromDto(dto: DTO<EventSourcedVideoViewModel>) {
        return new EventSourcedVideoViewModel(dto);
    }
}
