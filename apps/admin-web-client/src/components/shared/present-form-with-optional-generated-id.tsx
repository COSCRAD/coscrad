import { LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useLazyFetchIdQuery } from '../id-generation/store';

type Form = ({
    onClose,
    context,
    generatedId,
}: {
    onClose: () => void;
    context;
    generatedId?: string;
}) => JSX.Element;

interface FormProps {
    context: {
        resourceType: string;
        resourceId: string;
        // Hacky workaround
        languageCodesInUse?: LanguageCode[];
        buttonLabel: string;
    };
    form: Form;
}

export const PresentFormWithOptionalGeneratedId = ({
    context,
    form: ProvidedForm,
}: FormProps): JSX.Element => {
    const [isActiveForm, setIsActiveForm] = useState(false);

    const [trigger, { data: generatedId, error: idError, isFetching }] = useLazyFetchIdQuery();

    if (idError) {
        console.log({ idError });
    }

    if (isFetching) {
        console.log('loading id');
    }

    const { buttonLabel } = context;

    return (
        <Box>
            {isActiveForm ? (
                <ProvidedForm
                    generatedId={generatedId}
                    context={context}
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
                    {buttonLabel}
                </Button>
            )}
        </Box>
    );
};
