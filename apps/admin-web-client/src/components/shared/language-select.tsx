import { LanguageCode } from '@coscrad/api-interfaces';
import { MenuItem, Select } from '@mui/material';

interface LanguageSelectProps {
    onSelectLanguage: (languageCode: LanguageCode) => void;
}

export const LanguageSelect = ({ onSelectLanguage }: LanguageSelectProps) => {
    return (
        <Select
            data-testid={`select:language`}
            defaultValue={LanguageCode.English}
            label="Language"
            onChange={(e) => {
                onSelectLanguage(e.target.value as LanguageCode);
            }}
        >
            {Object.entries(LanguageCode).map(([label, languageCode]) => (
                <MenuItem value={languageCode} key={languageCode}>
                    {label}
                </MenuItem>
            ))}
        </Select>
    );
};
