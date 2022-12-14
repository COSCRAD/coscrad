import { IIndexQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';
import { renderTranscribedAudioMediaCell } from '../utils/render-transcribed-audio-media-cell';

export const TranscribedAudioIndexPresenter = (
    indexResult: IIndexQueryResult<ITranscribedAudioViewModel>
) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data: detailResult } = indexResult;

    const headingLabels: HeadingLabel<ITranscribedAudioViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        {
            propertyKey: 'lengthMilliseconds',
            headingLabel: 'Audio Length',
        },
        {
            propertyKey: 'audioURL',
            headingLabel: 'Audio',
        },
        /**
         * TODO[modelling]
         * We need to introduce more metadata on the model. It seems odd to
         * show the entire transcript here. Instead, we want to show a
         * title and maybe the participants, and so on.
         */
        { propertyKey: 'plainText', headingLabel: 'Transcript' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITranscribedAudioViewModel> = {
        id: renderAggregateIdCell,
        lengthMilliseconds: ({ lengthMilliseconds }: ITranscribedAudioViewModel) =>
            renderMediaLengthInSeconds(lengthMilliseconds),
        audioURL: ({ audioURL }: ITranscribedAudioViewModel) =>
            renderTranscribedAudioMediaCell(audioURL),
    };

    /**
     * We should think about how the following map will shift when we clean up
     * the structure of `IIndexQueryResult` and `IDetailQueryResult`.
     */
    const transcribedAudioItems = detailResult.map(({ data }) => data);

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={transcribedAudioItems}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Audio Transcripts'}
            filterableProperties={['plainText']}
        />
    );
};
