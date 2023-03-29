import { Typography } from '@mui/material';

interface CreatorPresenterProps {
    name: string;
    type: string;
}

export const CreatorPresenter = ({ name, type }: CreatorPresenterProps): JSX.Element => (
    <>
        <Typography component="span">{name}</Typography>
        {` `}
        <Typography component="span" sx={{ fontStyle: 'italic' }}>
            {`(${type})`}
        </Typography>
    </>
);
