import {
    IAudioItemViewModel,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualText,
    MIMEType,
} from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AudioItemCreated } from '../commands/create-audio-item/transcript-created.event';

export class EventSourcedAudioItemViewModel implements IDetailQueryResult<IAudioItemViewModel> {
    actions: ICommandFormAndLabels[];
    name: IMultilingualText;
    audioURL: string;
    mimeType: MIMEType;
    lengthMilliseconds: number;
    text: string;
    contributions: string[];
    id: string;

    static fromAudioItemCreated({
        payload: {
            aggregateCompositeIdentifier: { id: audioItemId },
            name,
            languageCodeForName,
            // mediaItemId, TODO deal with this
        },
        meta: { contributorIds },
    }: AudioItemCreated): EventSourcedAudioItemViewModel {
        const audioItem = new EventSourcedAudioItemViewModel();

        audioItem.id = audioItemId;

        audioItem.name = buildMultilingualTextWithSingleItem(name, languageCodeForName);

        // TODO join in contributors properly
        audioItem.contributions = contributorIds;

        return audioItem;
    }
}
