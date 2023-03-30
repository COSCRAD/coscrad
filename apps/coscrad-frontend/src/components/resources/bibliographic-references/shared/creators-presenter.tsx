import { IBibliographicReferenceCreator } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import { CommaSeparatedList } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/styled-comma-separated-list';
import { CreatorPresenter } from './creator-presenter';

interface CreatorsPresenterProps {
    creators: IBibliographicReferenceCreator[];
}

export const CreatorsPresenter = ({ creators }: CreatorsPresenterProps): JSX.Element => {
    {
        /* TODO: create uppercase label for `type` */
    }

    const creatorLabel = creators.length > 1 ? `Creators` : `Creator`;

    return (
        <Box sx={{ mb: 1 }}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
                {creatorLabel}:&nbsp;
            </Typography>
            <CommaSeparatedList>
                {creators.map(({ name, type }, index) => (
                    <span>
                        <CreatorPresenter key={name} name={name} type={type} />
                    </span>
                ))}
            </CommaSeparatedList>
        </Box>
    );
};
