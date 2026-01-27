import { IContributionSummary } from '@coscrad/api-interfaces';
import { ListRounded } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import PersonIcon from '@mui/icons-material/Person';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
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
            }}
        >
            <Typography
                variant="body1"
                fontWeight="fontWeightBold"
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px', // Optional: adds spacing between the icon and text
                }}
            >
                <IconButton>
                    <ListRounded />
                </IconButton>
                Contributions
            </Typography>
        </AccordionSummary>

        <AccordionDetails>
            <List sx={{ ml: 1 }}>
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
