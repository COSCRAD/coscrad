import { LanguageCode } from '@coscrad/api-interfaces';
import { MenuItem, Select } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';

interface LanguageSelectProps {
    onSelectLanguage: (languageCode: LanguageCode) => void;
}

export const LanguageSelect = ({ onSelectLanguage }: LanguageSelectProps) => {
    const { defaultUILanguageCode } = useContext(ConfigurableContentContext);

    return (
        <Select
            data-testid={`select:language`}
            defaultValue={defaultUILanguageCode}
            label="Language"
            onChange={(e) => {
                onSelectLanguage(e.target.value as LanguageCode);
            }}
        >
            {Object.entries(LanguageCode)
                .filter(([_label, languageCode]) =>
                    // This is robust to the case where English is the default language code
                    [LanguageCode.English, defaultUILanguageCode].includes(languageCode)
                )
                .map(([label, languageCode]) => (
                    <MenuItem value={languageCode} key={languageCode}>
                        {label}
                    </MenuItem>
                ))}
        </Select>
    );
};
