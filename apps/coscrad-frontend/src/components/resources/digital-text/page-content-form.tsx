import { LanguageCode } from '@coscrad/api-interfaces';
import { Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';

export interface TextAndLanguage {
    text: string;
    languageCode: LanguageCode;
}

interface PageContentFormProps {
    onSubmitNewContent: (state: TextAndLanguage) => void;
}

export const PageContentForm = ({ onSubmitNewContent }: PageContentFormProps) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const [text, setText] = useState<string>('');

    return (
        <>
            <TextField
                onChange={(e) => {
                    setText(e.target.value);
                }}
            ></TextField>
            <Button
                onClick={() => {
                    console.log(`submitting: ${text} (${defaultLanguageCode})`);

                    onSubmitNewContent({
                        text,
                        // TODO Make this selectable from a form as well
                        languageCode: defaultLanguageCode,
                    });
                }}
            >
                ADD
            </Button>
        </>
    );
};
