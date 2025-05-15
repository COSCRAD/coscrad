import { IContributionSummary } from '@coscrad/api-interfaces';
import { ListRounded } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
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

export const ContributionsPresenter = ({
    contributions,
}: {
    contributions: IContributionSummary[];
}): JSX.Element => (
    <>
        <Box elevation={0} component={Paper} sx={{ flexGrow: 1 }}>
            <IconButton>
                <ListRounded />
            </IconButton>
            Contributions
        </Box>

        <Box ml={1}>
            <List>
                {contributions.map((contribution, index) => (
                    <ListItem
                        disableGutters
                        style={{ borderBottom: '1px solid #ccc' }}
                        key={`${contribution.type}-${index}`}
                        data-testid={`${contribution.type}-${index}`}
                    >
                        <ContributionPresenter contribution={contribution} />
                        <Divider />
                    </ListItem>
                ))}
            </List>
        </Box>
    </>
);

interface ContributionPresenterProps {
    contribution: IContributionSummary;
}

const ContributionPresenter = ({ contribution: { statement } }: ContributionPresenterProps) => {
    return (
        <>
            <ListItemIcon>
                {/* Is this still relevant? */}
                <PersonIcon color="secondary" />
            </ListItemIcon>
            <Typography variant="body1">{statement}</Typography>
        </>
    );
};
