import { LanguageCode } from '@coscrad/api-interfaces';
import { Button, TextField } from '@mui/material';
import { useState } from 'react';
import { useLoadableGeneratedId } from '../../../store/slices/id-generation';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';
import { LanguageSelect } from './language-select';

interface FormProps {
    onSubmit: (text: string, languageCode: LanguageCode, id: string) => void;
}

export const ImmersiveCreateNoteForm = ({ onSubmit }: FormProps) => {
    const [text, setText] = useState('');

    const [languageCode, setLanguageCode] = useState<LanguageCode>(null);

    const { errorInfo, isLoading, data: generatedId } = useLoadableGeneratedId();

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    return (
        <>
            <TextField
                data-testid={`text:create-note`}
                onChange={(e) => {
                    setText(e.target.value);
                }}
            ></TextField>
            <LanguageSelect
                onSelectLanguage={(newLanguageCode: LanguageCode) => {
                    setLanguageCode(newLanguageCode);
                }}
            />
            <Button
                disabled={text.length === 0}
                onClick={() => {
                    onSubmit(text, languageCode, generatedId);
                }}
            >
                ADD NOTE
            </Button>
        </>
    );
};
