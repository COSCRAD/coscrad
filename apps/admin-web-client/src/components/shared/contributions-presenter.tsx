import { IContributionSummary } from '@coscrad/api-interfaces';
import { ListRounded as ListRoundedIcon } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import PersonIcon from '@mui/icons-material/Person';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    Paper,
    Typography,
} from '@mui/material';

export const ContributionsPresenter = ({
    contributions,
}: {
    contributions: IContributionSummary[];
}): JSX.Element => (
    <Accordion elevation={0} disableGutters data-testid="resource-contributions">
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
                minHeight: '25px', // Adjust to a smaller value (e.g., 40px)
                '&.Mui-expanded': {
                    minHeight: '25px', // Ensure it stays compact when expanded
                },
                maxHeight: '40px',
                mt: 1,
            }}
        >
            <List component={Paper} elevation={0} dense>
                <ListItem disableGutters sx={{ pt: 0, pb: 0, pl: 1 }}>
                    <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ccc', width: 30, height: 30 }}>
                            <ListRoundedIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <Typography variant="body1">Contributions</Typography>
                </ListItem>
            </List>
        </AccordionSummary>

        <AccordionDetails>
            <List component={Paper} elevation={0} sx={{ ml: 1 }} dense>
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
        </AccordionDetails>
    </Accordion>
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
