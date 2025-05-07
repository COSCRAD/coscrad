import { ContributorWithId } from '@coscrad/api-interfaces';
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
    contributions: ContributorWithId[];
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
                {contributions.map((contribution) => (
                    <ListItem
                        disableGutters
                        style={{ borderBottom: '1px solid #ccc' }}
                        key={`${contribution.fullName}-${contribution.id}`}
                        data-testid={`${contribution.id}`}
                    >
                        <ContributionPresenter contributor={contribution} />
                        <Divider />
                    </ListItem>
                ))}
            </List>
        </Box>
    </>
);

interface ContributionPresenterProps {
    contributor: ContributorWithId;
}

const ContributionPresenter = ({ contributor: { fullName } }: ContributionPresenterProps) => {
    return (
        <>
            <ListItemIcon>
                <PersonIcon color="secondary" />
            </ListItemIcon>
            <Typography variant="body1">{fullName}</Typography>
        </>
    );
};
