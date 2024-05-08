import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNonEmptyString, isNull, isUndefined } from '@coscrad/validation-constraints';

export type Matchers<T> = {
    [K in keyof T]?: (value: T[K], searchTerm: string) => boolean;
};

// Break out into separate file and test?
const isMultilingualText = (text: unknown): text is IMultilingualText => {
    if ((text as IMultilingualText).items) return true;

    return false;
};

// Make this into a matcher? or keep it as a default function to deal with all multilingual text?
const multilingualTextItemsToSearchableString = (multilingualText: IMultilingualText): string => {
    const searchableString = multilingualText.items.map(({ text }) => text).join(' ');

    return String(searchableString);
};

// TODO Unit test this and break this out into a lib
export const doesTextIncludeCaseInsensitive = (textToSearch: string, textToFind: string): boolean =>
    textToSearch.toLowerCase().includes(textToFind.toLowerCase());

const defaultStringify = (value: unknown): string => {
    if (isNull(value)) return '<null>';

    if (isUndefined(value)) return '<undefined>';

    if (isMultilingualText(value)) return multilingualTextItemsToSearchableString(value);

    return String(value);
};

// default to a case-insensitive search
export const defaultMatcher = (value: unknown, searchTerm: string): boolean =>
    doesTextIncludeCaseInsensitive(defaultStringify(value), searchTerm);

export const filterTableData = <T>(
    tableData: T[],
    selectedFilterableProperties: (keyof T)[],
    searchTerm: string,
    // We should limit this to matchers for the selected filterable properties
    matchers: Matchers<T> = {}
): T[] => {
    // Do not filter for empty search terms
    if (!isNonEmptyString(searchTerm)) return tableData;

    return tableData.filter((row) =>
        selectedFilterableProperties.some((propertyKey) => {
            const doesValueMatchSearchTerm = matchers[propertyKey] || defaultMatcher;

            const propertyValue = row[propertyKey];

            return doesValueMatchSearchTerm(propertyValue, searchTerm);
        })
    );
};
