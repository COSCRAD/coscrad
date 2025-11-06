import { ITermViewModel, LanguageCode } from '@coscrad/api-interfaces';
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
    IUserDefinedFilter,
    setTermFilters,
    useLoadableTerms,
} from '../../../store/slices/resources';

/**
 * Clearly this doesn't belong here. However, we want to generalize it to
 * work for other resource types. It's a matter of parsing the query string
 * based on the `CoscradDataType` of each field.
 *
 * We may end up moving this logic to the server.
 */
const compileMultilingualTextContainsQuery = (
    fieldName: keyof ITermViewModel,
    queryString: string
): IUserDefinedFilter<ITermViewModel> => {
    const extractedLanguageCode = queryString.slice(1).split('}')[0];

    const searchTermsWithLanguageCodeRemoved = queryString.split('}')[1];

    if (Object.values(LanguageCode).some((lc) => lc === extractedLanguageCode)) {
        return {
            type: 'SIMPLE',
            operator: 'MULTILINGUAL_TEXT_INCLUDES',
            field: fieldName,
            params: [searchTermsWithLanguageCodeRemoved, extractedLanguageCode],
        };
    }

    /**
     * If the language code is not a known language code, we naively search
     * for the text, e.g., including `{foo}` in `{foo}Ooops`.
     */
    return {
        type: 'SIMPLE',
        field: fieldName,
        operator: 'MULTILINGUAL_TEXT_INCLUDES',
        params: [queryString],
    };
};

const interpretCoscradQueryFromUserSearchText = (
    scope: IndexSearchScope<ITermViewModel>,
    queryString: string,
    defaultLanguageCode: LanguageCode = LanguageCode.English
): IUserDefinedFilter<ITermViewModel> => {
    if (scope === ALL_PROPERTIES_SEARCH_KEY) {
        return {
            type: 'OR',
            // @ts-expect-error TODO let's sort out the full types in api-interfaces
            conditions: (['name', 'contributions', 'vocabularyLists', 'tokens'] as const).map(
                (field) =>
                    interpretCoscradQueryFromUserSearchText(field, queryString, defaultLanguageCode)
            ),
        };
    }

    if (scope === 'name') {
        if (queryString.charAt(0) === '{' && queryString.includes('}')) {
            return compileMultilingualTextContainsQuery(scope, queryString);
        }
    }

    if (scope === 'contributions') {
        const simpleFilter = {
            type: 'SIMPLE',
            field: `contributions[*].statement`,
            operator: 'TEXT_INCLUDES',
            params: [queryString],
        };

        return simpleFilter;
    }

    if (scope === 'vocabularyLists') {
        return {
            type: 'SIMPLE',
            field: `vocabularyLists[*].name`,
            operator: 'MULTILINGUAL_TEXT_INCLUDES',
            // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-340] Include language code option
            params: [queryString],
        };
    }

    if (scope === 'tokens') {
        return {
            type: 'SIMPLE',
            field: `tokens`,
            // TODO support this
            operator: 'MULTILINGUAL_TEXT_INCLUDES_LETTER',
            /**
             * Allow the user to specify the language code once we tokenize English as well.
             * Right now, we assume that users will only search the Indigenous language
             * that is default for the tenant.
             */
            params: [queryString, defaultLanguageCode],
        };
    }

    const simpleFilter = {
        type: 'SIMPLE',
        field: scope,
        operator: 'MULTILINGUAL_TEXT_INCLUDES',
        params: [queryString],
    };

    return simpleFilter;
};

interface SearchBarProps {
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
