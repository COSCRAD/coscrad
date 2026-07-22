import { IContributionSummary } from '@coscrad/api-interfaces';
import { ListRounded, ListRounded as ListRoundedIcon } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import {
    Avatar,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
    Typography,
} from '@mui/material';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip
        describeChild
        {...props}
        classes={{ popper: className }}
        placement="bottom-start"
        arrow
    />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#487172ff',
        color: '#69e0e0ff',
        paddingTop: '10px',
        maxWidth: 520,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));

export const ContributionsPresenter = ({
    contributions,
}: {
    contributions: IContributionSummary[];
}): JSX.Element => (
    <div>
        <HtmlTooltip
            title={
                <>
                    <List dense>
                        <ListItem disableGutters sx={{ pt: 0, pb: 0, pl: 1 }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: '#ccc', width: 30, height: 30 }}>
                                    <ListRoundedIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <Typography variant="body1">System Contributions Record</Typography>
                        </ListItem>
                    </List>
                    <List sx={{ ml: 1 }} dense>
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
                </>
            }
        >
            <IconButton>
                <ListRounded />
            </IconButton>
        </HtmlTooltip>
    </div>
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
