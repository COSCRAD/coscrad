import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Typography } from '@mui/material';
import {
    ResourceDetailFullViewPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailFullViewPresenter = ({
    id,
    term,
    termEnglish,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    // Temporary workaround until `name` is on IBaseViewModel
    const name = term;

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.term}>
            <div data-testid={id} />
            <Typography variant="h4">{termEnglish}</Typography>
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <div id="media-player">
                <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
            </div>
        </ResourceDetailFullViewPresenter>
    );
};
