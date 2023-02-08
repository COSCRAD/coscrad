import { IAudioItemViewModel, ICategorizableDetailQueryResult } from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { FloatSpacerDiv } from '../../../utils/generic-components';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { convertMillisecondsToSeconds } from '../utils/math';
import './audio-item-detail.full-view.presenter.css';

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => (
    <div className="detail-full-view-container" title="View Connected Photograph" data-testid={id}>
        <div className="detail-full-view-media-container">
            <MediaPlayer audioUrl={audioURL} />
        </div>
        <div className="detail-full-view-meta-container">
            <SinglePropertyPresenter display="Transcribed Audio ID" value={id} />
            <SinglePropertyPresenter
                display="Duration"
                value={`${convertMillisecondsToSeconds(lengthMilliseconds)} secs`}
            />
            <SinglePropertyPresenter display="Audio Url" value={audioURL} />
            <SinglePropertyPresenter display="Transcription" value={plainText} />
        </div>
        <FloatSpacerDiv />
    </div>
);