import { LanguageCode } from '@coscrad/api-interfaces';
import { Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { LanguageSelect } from '../shared/language-select';

export interface TextAndLanguage {
    text: string;
    languageCode: LanguageCode;
}

interface PageContentFormProps {
    onSubmitNewContent: (state: TextAndLanguage) => void;
}

export const PageContentForm = ({ onSubmitNewContent }: PageContentFormProps) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const [selectedLanguageCode, setSelectedLanguageCode] = useState(defaultLanguageCode);

    const [text, setText] = useState<string>('');

    // ŝ
    return (
        <>
            <TextField
                sx={{ mb: 0.5 }}
                data-testid={`text:add-content-to-page:`}
                fullWidth
                onChange={(e) => {
                    setText(e.target.value);
                }}
                placeholder="Add page content here..."
                rows={15}
                multiline
            ></TextField>
            <LanguageSelect
                onSelectLanguage={(languageCode: LanguageCode) => {
                    setSelectedLanguageCode(languageCode);
                }}
            />
            <Button
                onClick={() => {
                    onSubmitNewContent({
                        text,
                        languageCode: selectedLanguageCode,
                    });
                }}
            >
                ADD CONTENT
            </Button>
        </>
    );
};
