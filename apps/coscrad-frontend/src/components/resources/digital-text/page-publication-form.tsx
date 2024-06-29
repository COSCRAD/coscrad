import { Button } from '@mui/material';
import { useState } from 'react';

interface PublicationFormProps {
    onSubmitForPublication: () => void;
}

/**
 * TODO Move this to a higher level directory
 */
export const PublicationForm = ({ onSubmitForPublication }: PublicationFormProps) => {
    const [isDisabled, setIsDisabled] = useState(false);

    return (
        <Button
            data-testid="action:publish"
            disabled={isDisabled}
            onClick={() => {
                setIsDisabled(true);

                onSubmitForPublication();
            }}
        >
            Publish Digital Text
        </Button>
    );
};
