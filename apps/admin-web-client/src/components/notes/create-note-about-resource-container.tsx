import { Button } from '@mui/material';
import { useState } from 'react';
import { useLazyFetchIdQuery } from '../id-generation/store';
import { CreateNoteAboutResourceForm } from './create-note-about-resource-form';

interface FormProps {
    resourceId: string;
    resourceType: string;
}

export const CreateNoteAboutResourceContainer = ({
    resourceId,
    resourceType,
}: FormProps): JSX.Element => {
    console.log(`${CreateNoteAboutResourceContainer.name} rendered.`);

    const [isActiveForm, setIsActiveForm] = useState(false);

    const [trigger, { data: generatedId, error: idError, isFetching }] = useLazyFetchIdQuery();

    if (idError) {
        console.log({ idError });
    }

    if (isFetching) {
        console.log('loading id');
    }

    return (
        <>
            <div></div>
            {isActiveForm ? (
                <CreateNoteAboutResourceForm
                    generatedId={generatedId}
                    resourceId={resourceId}
                    resourceType={resourceType}
                    onClose={() => {
                        setIsActiveForm(false);
                    }}
                />
            ) : (
                <Button
                    onClick={() => {
                        setIsActiveForm(true);

                        trigger();
                    }}
                >
                    Add Note
                </Button>
            )}
        </>
    );
};
