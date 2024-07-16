import {
    ContributorWithId,
    IAudioItemViewModel,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualText,
    MIMEType,
} from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { AudioItemCreated } from '../commands/create-audio-item/transcript-created.event';

export class EventSourcedAudioItemViewModel implements IDetailQueryResult<IAudioItemViewModel> {
    actions: ICommandFormAndLabels[];
    name: IMultilingualText;
    mediaItemId: AggregateId;
    mimeType: MIMEType;
    lengthMilliseconds: number;
    text: string;
    contributions: ContributorWithId[];
    id: string;

    static fromAudioItemCreated({
        payload: {
            aggregateCompositeIdentifier: { id: audioItemId },
            name,
            languageCodeForName,
            mediaItemId,
        },
        meta: { contributorIds },
    }: AudioItemCreated): EventSourcedAudioItemViewModel {
        const audioItem = new EventSourcedAudioItemViewModel();

        audioItem.id = audioItemId;

        audioItem.name = buildMultilingualTextWithSingleItem(name, languageCodeForName);

        // TODO join in contributors properly
        audioItem.contributions = contributorIds.map((contributorId) => ({
            id: contributorId,
            fullName: contributorId,
        }));

        audioItem.mediaItemId = mediaItemId;

        return audioItem;
    }
}
