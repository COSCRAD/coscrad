import { LanguageCode } from '@coscrad/api-interfaces';
import { Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { LanguageSelect } from './language-select';

export interface TextAndLanguage {
    text: string;
    languageCode: LanguageCode;
}

interface PageContentTranslationFormProps {
    onSubmitTranslationForContent: (state: TextAndLanguage) => void;
    /**
     * We filter out the languages that this page already has to avoid allowing
     * the user to execute a translate command that is guaranteed to fail, as a 
     * matter of UX.
     * 
     * If we did full server-side rendering, we wouldn't have to execute
     * this kind of logic on the client.
     * 
     * TODO We shouldn't render this form at all if there's no available
     * language into which to translate.
     */
    existingLanguageCodes: LanguageCode[]
}

/**
 * TODO Can we better share this logic with `PageContentForm`? It's essentially
 * just a `multilingual-text-form`.
 */
export const PageContentTranslationForm = ({ onSubmitTranslationForContent,existingLanguageCodes }: PageContentTranslationFormProps) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const [selectedLanguageCode, setSelectedLanguageCode] = useState(defaultLanguageCode);

    const [text, setText] = useState<string>('');

    return (
        <>
            <TextField
                data-testid={`text:translate-digital-text-page-content`}
                onChange={(e) => {
                    setText(e.target.value);
                }}
            ></TextField>
            <LanguageSelect
                onSelectLanguage={(languageCode: LanguageCode) => {
                    setSelectedLanguageCode(languageCode);
                }}
                languageCodesToOmit={existingLanguageCodes}
            />
            <Button
                onClick={() => {
                    onSubmitTranslationForContent({
                        text,
                        languageCode: selectedLanguageCode,
                    });
                }}
            >
                TRANSLATE
            </Button>
        </>
    );
};
