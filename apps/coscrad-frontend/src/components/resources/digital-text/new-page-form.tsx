import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface NewPageFormProps {
    onSubmitPageIdentifier: (pageIdentifier: string) => void;
    existingPageIdentifiers: string[];
}

export const NewPageForm = ({
    onSubmitPageIdentifier,
    existingPageIdentifiers,
}: NewPageFormProps) => {
    const [pageIdentifier, setPageIdentifier] = useState<string>('');

    const [formFeedback, setFormFeedback] = useState<string>('');

    const disallowedCharacters = [' ', '\t', '\n'];

    // TODO Ensure the back-end handles this with an explicit test case
    const hasValidFormat = !disallowedCharacters.some(
        (invalidChar) => pageIdentifier.indexOf(invalidChar) !== -1
    );

    /**
     * TODO [https://www.pivotaltracker.com/story/show/186539848] Expose validation errors to the user
     */
    const isDisabled =
        !hasValidFormat ||
        !isNonEmptyString(pageIdentifier) ||
        existingPageIdentifiers.includes(pageIdentifier);

    useEffect(() => {
        if (isDisabled && pageIdentifier !== '') {
            setFormFeedback(`Page ${pageIdentifier} already exists or contains invalid characters`);
        } else if ((!isDisabled && pageIdentifier !== '') || pageIdentifier === '') {
            setFormFeedback('');
        }
    }, [pageIdentifier, formFeedback, setFormFeedback, hasValidFormat, isDisabled]);

    return (
        <Box sx={{ height: '120px', '& .MuiTextField-root': { width: '10ch' } }}>
            <Typography variant="h6">Add New Page</Typography>
            <TextField
                data-testid="text:add-page-to-digital-text"
                onChange={(e) => {
                    setPageIdentifier(e.target.value);
                }}
                placeholder="Page Number (e.g., 1 or IX)"
            />
            <Button
                onClick={() => {
                    onSubmitPageIdentifier(pageIdentifier);
                }}
                disabled={isDisabled}
                // TODO Is this necessary?
                aria-disabled={isDisabled}
            >
                ADD
            </Button>
            <Typography variant="body1" sx={{ color: 'warning.main' }}>
                {formFeedback}
            </Typography>
        </Box>
    );
};
