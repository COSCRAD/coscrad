import { ITermViewModel } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { SearchRounded } from '@mui/icons-material';
import {
    Box,
    Checkbox,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { useContext, useState } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { ALL_PROPERTIES_SEARCH_KEY } from './term-index-table';

interface SearchBarProps {
    onValueChange: (
        scope: keyof ITermViewModel | typeof ALL_PROPERTIES_SEARCH_KEY,
        newValue: string
    ) => void;

    specialCharacterReplacements?: Record<string, string>;

    scopes: string[];
}

/**
 * Note that the following is required in case text is pasted or entered
 * from a system keyboard using the consonant + lone surrogate representation
 * instead of the single Unicode keypoint. The resulting characters are not
 * equivalent with respect to
 * - string comparison
 * - object keys
 * - map keys
 * in JavaScript.
 *
 * TODO support marked high tone on vowels:
 *
 * TODO Unit test the replacement logic
 * Also, can we standardize either using the escape sequence
 * in the string literal **or** String.fromCodePoint across the
 * code base?
 */
// TODO Named consonants \ dictionary
const defaultCharacterReplacements = {
    // (U+0073) - ◌̂ (U+0302)[
    // ŝ
    [`s${`\u0302`}`]: '\u015d',
    // Ŝ
    [`S${`\u0302`}`]: '\u015c',
    // ŵ
    [`w${`\u0302`}`]: '\u0175',
    // Ŵ
    [`W${`\u0302`}`]: '\u0174',
    // ẑ:
    [`z${`\u0302`}`]: '\u1e91',
    // Ẑ
    [`Z${`\u0302`}`]: '\u1e91',
};

const labelForSearchAllPropertiesOption = 'ALL';

export const TermSearchBar = ({ onValueChange, scopes }: SearchBarProps) => {
    const [value, setValue] = useState('');

    const [shouldUseVirtualKeyboard, setShouldUseVirtualKeyboard] = useState<boolean>(true);

    const { simulatedKeyboard } = useContext(ConfigurableContentContext);

    // SEARCH LOGIC
    const [selectedFilterProperty, setSelectedFilterProperty] = useState<
        typeof ALL_PROPERTIES_SEARCH_KEY | keyof ITermViewModel
    >(ALL_PROPERTIES_SEARCH_KEY);

    const specialCharacterReplacements = shouldUseVirtualKeyboard
        ? Object.assign(
              simulatedKeyboard?.specialCharacterReplacements || {},
              defaultCharacterReplacements
          )
        : defaultCharacterReplacements;

    const propertiesToSearchSelectField = (
        <FormControl sx={{ minWidth: 120 }} size={'small'}>
            <InputLabel>Filter</InputLabel>
            <Select
                data-testid="select_index_search_scope"
                label={'Filter'}
                value={selectedFilterProperty}
                onChange={(changeEvent) => {
                    const {
                        target: { value },
                    } = changeEvent;
                    setSelectedFilterProperty(value as keyof ITermViewModel);
                }}
            >
                <MenuItem sx={{ minWidth: 120 }} value={ALL_PROPERTIES_SEARCH_KEY}>
                    {labelForSearchAllPropertiesOption}
                </MenuItem>
                {scopes.map((selectedFilterProperty: keyof ITermViewModel & string) => (
                    <MenuItem
                        key={selectedFilterProperty}
                        value={selectedFilterProperty}
                        sx={{ minWidth: 120 }}
                    >
                        {/* THIS SHOULD BE A LABEL */}
                        {
                            selectedFilterProperty
                            // headingLabels.find(
                            //     ({ propertyKey: labelPropertyKey }) =>
                            //         labelPropertyKey === selectedFilterProperty
                            // )?.headingLabel
                        }
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    return (
        <Stack>
            <Box>
                {propertiesToSearchSelectField}
                <TextField
                    data-testid="index_search_bar"
                    size="small"
                    placeholder="Search..."
                    value={value}
                    onChange={(changeEvent) => {
                        const searchValue = changeEvent.target.value;

                        const transformedValue = Object.entries(
                            specialCharacterReplacements
                        ).reduce(
                            (incomingText: string, [input, replacement]) =>
                                incomingText.replace(input, replacement),
                            searchValue
                        );

                        setValue(transformedValue);

                        onValueChange(selectedFilterProperty, transformedValue);
                    }}
                    InputProps={{
                        endAdornment: <SearchRounded />,
                    }}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Checkbox
                    checked={shouldUseVirtualKeyboard}
                    onChange={() => setShouldUseVirtualKeyboard(!shouldUseVirtualKeyboard)}
                />

                {!isNullOrUndefined(simulatedKeyboard) && shouldUseVirtualKeyboard ? (
                    <p>Special Character Input Method: {simulatedKeyboard.name}</p>
                ) : (
                    <p>Click to enable input method: {simulatedKeyboard.name}</p>
                )}
            </Box>
        </Stack>
    );
};
