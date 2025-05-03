import { ContributorWithId } from '@coscrad/api-interfaces';
import { ListRounded as ListRoundedIcon } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Grid, List, ListItem, ListItemAvatar, Paper, Typography } from '@mui/material';

export const ContributionsPresenter = ({
    contributions,
}: {
    contributions: ContributorWithId[];
}): JSX.Element => (
    <Grid container direction="column">
        <Grid item>
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
        </Grid>
        <Grid item>
            <List dense>
                {contributions.map((contribution) => (
                    <ListItem
                        disableGutters
                        sx={{ borderBottom: '1px solid #ccc', pt: 0, pb: 0.2, pl: 1 }}
                        key={`${contribution.fullName}-${contribution.id}`}
                        data-testid={`${contribution.id}`}
                    >
                        <ContributionPresenter contributor={contribution} />
                    </ListItem>
                ))}
            </List>
        </Grid>
    </Grid>
);

interface ContributionPresenterProps {
    contributor: ContributorWithId;
}

const ContributionPresenter = ({ contributor: { fullName } }: ContributionPresenterProps) => {
    return (
        <>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'white' }}>
                    <PersonIcon color="secondary" />
                </Avatar>
            </ListItemAvatar>
            <Typography variant="body1">{fullName}</Typography>
        </>
    );
};
