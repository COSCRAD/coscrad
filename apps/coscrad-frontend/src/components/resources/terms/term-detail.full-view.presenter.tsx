import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box } from '@mui/material';
import {
    ResourceDetailFullViewPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributor,
    audioURL,
    context,
    onContextChange,
}: ICategorizableDetailQueryResult<ITermViewModel> & ContextProps): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.term}
            onContextSelection={onContextChange}
        >
            <Box data-testid={id} />
            context: {JSON.stringify(context)}
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
