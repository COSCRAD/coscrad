import {
    AggregateType,
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
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.term}>
            <Box
                data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.term, id)}
            />
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
