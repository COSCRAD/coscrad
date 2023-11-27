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
