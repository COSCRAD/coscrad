import { AggregateType, IAudioItemViewModel } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { AudioItemIndexState } from '../../../store/slices/resources/audio-item/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAbbreviatedTranscriptionTextCell } from '../utils/render-abbreviated-transcription-text-cell';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const TranscribedAudioIndexPresenter = ({
    entities: transcribedAudioItems,
}: AudioItemIndexState) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const headingLabels: HeadingLabel<IAudioItemViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'name', headingLabel: 'Title' },
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
        name: ({ name }: IAudioItemViewModel) =>
            renderMultilingualTextCell(name, defaultLanguageCode),
        lengthMilliseconds: ({ lengthMilliseconds }: IAudioItemViewModel) =>
            renderMediaLengthInSeconds(lengthMilliseconds),
        text: ({ text }: IAudioItemViewModel) => renderAbbreviatedTranscriptionTextCell(text),
        // audioURL: ({ audioURL }: IAudioItemViewModel) =>
        //     renderTranscribedAudioMediaCell(audioURL),
    };

    return (
        <IndexTable
            type={AggregateType.audioItem}
            headingLabels={headingLabels}
            tableData={transcribedAudioItems}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Audio Items'}
            filterableProperties={['text']}
        />
    );
};
