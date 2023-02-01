import { IAudioItemViewModel } from '@coscrad/api-interfaces';
import { AudioItemIndexState } from '../../../store/slices/resources/audio-item/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';

export const TranscribedAudioIndexPresenter = ({
    entities: transcribedAudioItems,
}: AudioItemIndexState) => {
    const headingLabels: HeadingLabel<IAudioItemViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        {
            propertyKey: 'lengthMilliseconds',
            headingLabel: 'Audio Length',
        },

        // TODO [https://www.pivotaltracker.com/story/show/184048108]
        // Play audio (Spotify experience)
        // {
        //     propertyKey: 'audioURL',
        //     headingLabel: 'Audio',
        // },
        /**
         * TODO[modelling]
         * We need to introduce more metadata on the model. It seems odd to
         * show the entire transcript here. Instead, we want to show a
         * title and maybe the participants, and so on.
         */
        { propertyKey: 'text', headingLabel: 'Transcript' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IAudioItemViewModel> = {
        id: renderAggregateIdCell,
        lengthMilliseconds: ({ lengthMilliseconds }: IAudioItemViewModel) =>
            renderMediaLengthInSeconds(lengthMilliseconds),
        // audioURL: ({ audioURL }: IAudioItemViewModel) =>
        //     renderTranscribedAudioMediaCell(audioURL),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={transcribedAudioItems}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Audio Transcripts'}
            filterableProperties={['text']}
        />
    );
};
