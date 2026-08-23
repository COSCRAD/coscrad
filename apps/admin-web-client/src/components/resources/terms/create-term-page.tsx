import { useAuth0 } from '@auth0/auth0-react';
import { ResourceType } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { CreateTermForm } from './create-term-form';

export const CreateTermPage = (): JSX.Element => {
    const { isAuthenticated } = useAuth0();

    const heading = 'Terms';

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h2">{heading}</Typography>
            <Box>
                {isAuthenticated ? (
                    <PresentFormWithOptionalGeneratedId
                        form={CreateTermForm}
                        context={{
                            resourceType: ResourceType.term,
                            buttonLabel: 'CREATE TERM',
                        }}
                    />
                ) : null}
            </Box>
        </Box>
    );
};
