import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

interface NewPageFormProps {
    onSubmitPageIdentifier: (pageIdentifier: string) => void;
}

export const NewPageForm = ({ onSubmitPageIdentifier }: NewPageFormProps) => {
    const [pageIdentifier, setPageIdentifier] = useState<string>('');

    return (
        <Stack>
            <TextField
                onChange={(e) => {
                    console.log({ eTargetValue: e.target.value });
                    setPageIdentifier(e.target.value);
                }}
            />
            <Button
                onClick={() => {
                    onSubmitPageIdentifier(pageIdentifier);
                }}
            >
                ADD PAGE: {pageIdentifier}
            </Button>
        </Stack>
    );
};
