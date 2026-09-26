import { useAuth0 } from '@auth0/auth0-react';
import { LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Dialog, DialogContent, DialogTitle, styled } from '@mui/material';
import { useState } from 'react';
import { useLazyFetchIdQuery } from '../id-generation/store';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
}));

type Form = ({
    onClose,
    context,
    generatedId,
}: {
    onClose: () => void;
    context?;
    generatedId?: string;
}) => JSX.Element;

interface FormProps {
    context: {
        resourceType?: string;
        resourceId?: string;
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
    const [trigger, { data: generatedId, error: idError, isFetching }] = useLazyFetchIdQuery();

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const { isAuthenticated } = useAuth0();

    if (!isAuthenticated) return <div>Form Unavailable</div>;

    if (idError) {
        console.log({ idError });
    }

    if (isFetching) {
        console.log('loading id');
    }

    const { buttonLabel } = context;

    return (
        <Box>
            <Button
                onClick={() => {
                    handleClickOpen();

                    trigger();
                }}
            >
                {buttonLabel}
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{buttonLabel}</DialogTitle>
                <DialogContent>
                    <ProvidedForm
                        generatedId={generatedId}
                        context={context}
                        onClose={() => {
                            handleClose();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};
