import { SearchRounded } from '@mui/icons-material';
import { TextField } from '@mui/material';

interface SearchBarProps {
    value: string;

    onValueChange: (newValue: string) => void;

    specialCharacterReplacements?: Record<string, string>;
}

export const SearchBar = ({
    value,
    onValueChange,
    specialCharacterReplacements = {},
}: SearchBarProps) => (
    <TextField
        size="small"
        placeholder="Search..."
        value={value}
        onChange={(changeEvent) => {
            const searchValue = changeEvent.target.value;

            const transformedValue = Object.entries(specialCharacterReplacements).reduce(
                (incomingText: string, [input, replacement]) =>
                    incomingText.replace(input, replacement),
                searchValue
            );

            onValueChange(transformedValue);
        }}
        InputProps={{
            endAdornment: <SearchRounded />,
        }}
    />
);
