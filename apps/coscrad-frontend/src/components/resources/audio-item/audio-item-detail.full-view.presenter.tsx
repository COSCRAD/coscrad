import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { CoscradMainContentContainer } from '../../../utils/generic-components/style-components/coscrad-main-content-container';
import { convertMillisecondsToSeconds } from '../utils/math';

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const formatedPlainText = plainText.split('\n').map((line, index) => <p key={index}>{line}</p>);

    return (
        <CoscradMainContentContainer>
            <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
                <MediaPlayer audioUrl={audioURL} />
                <SinglePropertyPresenter
                    display="Duration"
                    value={`${convertMillisecondsToSeconds(lengthMilliseconds)} secs`}
                />
                <SinglePropertyPresenter display="Audio Url" value={audioURL} />
                <SinglePropertyPresenter display="Text" value={formatedPlainText} />
            </ResourceDetailFullViewPresenter>
        </CoscradMainContentContainer>
    );
};
