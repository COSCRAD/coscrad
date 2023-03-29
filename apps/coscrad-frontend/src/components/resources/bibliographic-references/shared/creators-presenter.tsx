import { IBibliographicReferenceCreator } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import { CreatorPresenter } from './creator-presenter';

interface CreatorsPresenterProps {
    creators: IBibliographicReferenceCreator[];
}

export const CreatorsPresenter = ({ creators }: CreatorsPresenterProps): JSX.Element => {
    {
        /* TODO: create uppercase label for `type` */
    }

    const creatorLabel = creators.length > 1 ? `Creators:` : `Creator:`;

    return (
        <Box sx={{ mb: 1 }}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
                {creatorLabel}
            </Typography>
            {` `}
            {creators.map(({ name, type }, index) => (
                <>
                    <CreatorPresenter key={name} name={name} type={type} />
                    {creators.length > 1 && index < creators.length - 1 && <span>, </span>}
                </>
            ))}
        </Box>
    );
};
