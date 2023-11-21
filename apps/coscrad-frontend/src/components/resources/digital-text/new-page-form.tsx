import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

interface NewPageFormProps {
    onSubmitPageIdentifier: (pageIdentifier: string) => void;
    existingPageIdentifiers: string[];
}

export const NewPageForm = ({
    onSubmitPageIdentifier,
    existingPageIdentifiers,
}: NewPageFormProps) => {
    const [pageIdentifier, setPageIdentifier] = useState<string>('');

    // remove leading and trailing white space
    const parsedPageIdentifier = pageIdentifier.trim();

    // TODO Ensure the back-end handles this with an explicit test case
    const hasValidFormat = parsedPageIdentifier.indexOf(' ') === -1;

    /**
     * TODO Expose validation errors to the user
     */
    const isDisabled =
        !hasValidFormat ||
        !isNonEmptyString(parsedPageIdentifier) ||
        existingPageIdentifiers.includes(parsedPageIdentifier);

    return (
        <Stack>
            <TextField
                data-testid="text:add-page-to-digital-text"
                onChange={(e) => {
                    console.log({ eTargetValue: e.target.value });
                    setPageIdentifier(e.target.value);
                }}
            />
            <Button
                onClick={() => {
                    onSubmitPageIdentifier(pageIdentifier);
                }}
                disabled={isDisabled}
                // TODO Is this necessary?
                aria-disabled={isDisabled}
            >
                ADD PAGE: {pageIdentifier}
            </Button>
        </Stack>
    );
};
