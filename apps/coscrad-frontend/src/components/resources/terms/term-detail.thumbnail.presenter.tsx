import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Typography } from '@mui/material';
import {
    ResourceDetailThumbnailPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';

export const TermDetailThumbnailPresenter = ({
    id,
    term,
    termEnglish,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    // Temporary workaround until `name` is on IBaseViewModel
    const name = term;

    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.term}>
            <div data-testid={id} />
            <Typography variant="h4">{termEnglish}</Typography>
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <div id="media-player">
                <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
            </div>
        </ResourceDetailThumbnailPresenter>
    );
};
