import {
    ContributorWithId,
    ICommandFormAndLabels,
    IMultilingualText,
    LanguageCode,
    MIMEType,
} from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { buildMultilingualTextFromBilingualText } from '../../../../../domain/common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { Transcript } from '../../shared/entities/transcript.entity';

@CoscradDataExample<EventSourcedVideoViewModel>({
    example: {
        id: buildDummyUuid(6),
        // are we still using this?
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
        // we need this on the playlist view as well
        accessControlList: new AccessControlList(),
        isPublished: false,
    },
})
export class EventSourcedVideoViewModel {
    actions: ICommandFormAndLabels[];
    name: IMultilingualText;
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

    public static fromDto(dto: DTO<EventSourcedVideoViewModel>) {
        return new EventSourcedVideoViewModel(dto);
    }
}
