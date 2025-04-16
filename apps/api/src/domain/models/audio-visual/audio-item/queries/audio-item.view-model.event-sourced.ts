import {
    ContributorWithId,
    IAudioItemViewModel,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualText,
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
import { AudioItemCreated } from '../commands/create-audio-item/audio-item-created.event';

@CoscradDataExample<EventSourcedAudioItemViewModel>({
    example: {
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
        text: '',
        contributions: [],
        // we need this on the playlist view as well
        accessControlList: new AccessControlList(),
        isPublished: false,
    },
})
export class EventSourcedAudioItemViewModel implements IDetailQueryResult<IAudioItemViewModel> {
    actions: ICommandFormAndLabels[];
    name: IMultilingualText;
    mediaItemId: AggregateId;
    mimeType: MIMEType;
    lengthMilliseconds: number;
    text: string;
    contributions: ContributorWithId[];
    id: string;
    accessControlList: { allowedUserIds: string[]; allowedGroupIds: string[] };

    constructor(dto: DTO<EventSourcedAudioItemViewModel>) {
        if (!dto) return;

        const {
            name,
            mediaItemId,
            mimeType,
            lengthMilliseconds,
            text,
            contributions,
            id,
            accessControlList,
        } = dto;

        if (isNonEmptyObject(accessControlList)) {
            this.accessControlList = new AccessControlList(accessControlList);
        } else {
            // no priviliged access
            this.accessControlList = new AccessControlList();
        }

        this.name = new MultilingualText(name);

        this.mediaItemId = mediaItemId;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;

        this.text = text;

        this.contributions = contributions;

        this.actions = [];

        this.id = id;
    }

    isPublished: boolean;

    static fromAudioItemCreated({
        payload: {
            aggregateCompositeIdentifier: { id: audioItemId },
            name,
            languageCodeForName,
            mediaItemId,
            // mimeType
            lengthMilliseconds,
        },
        meta: { contributorIds: _ },
    }: AudioItemCreated): EventSourcedAudioItemViewModel {
        return new EventSourcedAudioItemViewModel({
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            mediaItemId,
            id: audioItemId,
            actions: [],
            // TODO set this
            contributions: [],
            isPublished: false,
            // FIX this
            mimeType: MIMEType.wav,
            text: '',
            lengthMilliseconds,
            // we need a `RESOURCE_READ_ACCESS_GRANTED_TO_USER`
            accessControlList: new AccessControlList(),
        });
    }

    public static fromDto(dto: DTO<EventSourcedAudioItemViewModel>) {
        return new EventSourcedAudioItemViewModel(dto);
    }
}
