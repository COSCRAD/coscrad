import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { MenuItem, Select } from '@mui/material';

interface LanguageSelectProps {
    languageCodesInUse?: LanguageCode[];
    onSelectLanguage: (languageCode: LanguageCode) => void;
}

export const LanguageSelect = ({ languageCodesInUse, onSelectLanguage }: LanguageSelectProps) => {
    const defaultOption = '- Select Language - ';

    return (
        <Select
            data-testid={`select:language`}
            defaultValue={defaultOption}
            label="Language"
            onChange={(e) => {
                onSelectLanguage(e.target.value as LanguageCode);
            }}
        >
            <MenuItem value={defaultOption} key={'default-language'}>
                {defaultOption}
            </MenuItem>
            {Object.entries(LanguageCode).map(([label, languageCode]) => {
                if (
                    !isNullOrUndefined(languageCodesInUse) &&
                    languageCodesInUse.includes(languageCode)
                )
                    return null;

                return (
                    <MenuItem value={languageCode} key={languageCode}>
                        {label}
                    </MenuItem>
                );
            })}
        </Select>
    );
};
