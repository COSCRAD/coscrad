import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ISongViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    Paper,
    Typography,
} from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

import { ListRounded, Person } from '@mui/icons-material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { Optional } from '../../../utils/generic-components/presenters/optional';
import { CreditsHack } from './credits-hack';

interface ContributionPresenterProps {
    contributor: string;
}

const ContributionPresenter = ({ contributor }: ContributionPresenterProps) => {
    return (
        <List>
            <ListItem disableGutters disablePadding>
                <ListItemIcon>
                    <Person color="secondary" />
                </ListItemIcon>
                <Typography variant="body1">{contributor}</Typography>
            </ListItem>
        </List>
    );
};

export const SongDetailFullViewPresenter = ({
    id,
    name,
    lyrics,
    audioURL,
    contributions,
}: ICategorizableDetailQueryResult<ISongViewModel>): JSX.Element => {
    const { songIdToCredits } = useContext(ConfigurableContentContext);

    const creditsMap = new Map<string, string>(
        Object.entries(songIdToCredits as Record<string, string>)
    );

    return (
        <ResourceDetailFullViewPresenter
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.song, id)}
            name={name}
            id={id}
            type={ResourceType.song}
        >
            <Optional predicateValue={lyrics}>
                <MultilingualTextPresenter text={lyrics} />
            </Optional>
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>

            <Box>
                <Box elevation={0} component={Paper}>
                    <IconButton>
                        <ListRounded />
                    </IconButton>
                    Contributions
                </Box>

                <Box ml={1}>
                    {(contributions || []).map((contribution) => {
                        return (
                            <Box>
                                <ContributionPresenter contributor={contribution} />
                                <Divider />
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box className="detail-meta">
                <CreditsHack resourceId={id} creditsMap={creditsMap} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
