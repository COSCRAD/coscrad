import { Button, TextField } from '@mui/material';
import { useState } from 'react';
import { useLoadableGeneratedId } from '../../../store/slices/id-generation';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';

interface FormProps {
    onSubmit: (text: string, id: string) => void;
}

export const ImmersiveCreateNoteForm = ({ onSubmit }: FormProps) => {
    const [text, setText] = useState('');

    const { errorInfo, isLoading, data: generatedId } = useLoadableGeneratedId();

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    return (
        <>
            <TextField
                onChange={(e) => {
                    setText(e.target.value);
                }}
            ></TextField>
            <Button
                disabled={text.length === 0}
                onClick={() => {
                    onSubmit(text, generatedId);
                }}
            >
                ADD NOTE
            </Button>
        </>
    );
};
