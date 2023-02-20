import { ICategorizableDetailQueryResult, IVideoViewModel } from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    text: plainText,
    name,
    id,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id}>
        <SinglePropertyPresenter
            display="Duration"
            value={convertMillisecondsToSeconds(lengthMilliseconds)}
        />
        <h3>Transcript:</h3>
        <p>{plainText}</p>
    </ResourceDetailFullViewPresenter>
);
