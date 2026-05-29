import { ITermViewModel } from '@coscrad/api-interfaces';
import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
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
import { useAppDispatch } from '../../../app/hooks';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import {
    ALL_PROPERTIES_SEARCH_KEY,
    fetchTerms,
    filterTermsInMemory,
    IndexSearchScope,
    setTermFilters,
    useLoadableTerms,
} from '../../../store/slices/resources';
import { HeadingLabel } from '../../../utils/generic-components/presenters/tables';

interface SearchBarProps {
    specialCharacterReplacements?: Record<string, string>;

    scopes: HeadingLabel<ITermViewModel>[];
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

/**
 * Note that this is a duplication of the generic `SearchBar`. We have encapsulated
 * the virtual keyboard in this version. Eventually, we want to generalize
 * the `TermSearchBar` for use with other resource index views as we move them
 * all to server side filtering \ pagination.
 */
export const TermSearchBar = ({ scopes }: SearchBarProps) => {
    const [value, setValue] = useState('');

    const [shouldUseVirtualKeyboard, setShouldUseVirtualKeyboard] = useState<boolean>(true);

    const { simulatedKeyboard } = useContext(ConfigurableContentContext);

    const dispatch = useAppDispatch();

    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { pageSize } = useLoadableTerms();

    const searchInDb = (scope: IndexSearchScope<ITermViewModel>, queryFromForm: string) => {
        if (!isNonEmptyString(queryFromForm)) {
            return dispatch(fetchTerms(null));
        }

        /**
         * TODO We haven't settled on how we will handle this in the long run.
         * We have started by compiling a query string on the client because
         * that is consistent with the current UX. However, we are considering
         * updating the UX and leveraging a more sophisticated search form whose
         * state would be object-valued already.
         *
         * If we stick with compiling string queries, we may want to send the
         * string to the back-end for compilation. Note that at some point we
         * may want to use the same query language for in-memory filtering,
         * in which case we could move that logic to a lib.
         */

        const filter = interpretCoscradQueryFromUserSearchText(
            scope,
            queryFromForm,
            defaultLanguageCode
        );

        dispatch(setTermFilters({ filter }));

        dispatch(
            fetchTerms({
                pagination: {
                    page: 1,
                    size: pageSize,
                },
            })
        );
    };

    const _searchInMemory = (scope: IndexSearchScope<ITermViewModel>, queryFromForm: string) => {
        // TODO type safety
        const action = filterTermsInMemory({ scope, query: queryFromForm });

        dispatch(action);
    };

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
                {scopes.map(
                    ({ propertyKey: selectedFilterProperty, headingLabel: propertyLabel }) => (
                        <MenuItem
                            key={selectedFilterProperty}
                            value={selectedFilterProperty}
                            sx={{ minWidth: 120 }}
                        >
                            {propertyLabel}
                        </MenuItem>
                    )
                )}
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

                        searchInDb(selectedFilterProperty, transformedValue);
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
