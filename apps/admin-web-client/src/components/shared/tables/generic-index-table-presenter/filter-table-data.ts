import { isNonEmptyString, isNull, isUndefined } from '@coscrad/validation-constraints';
import { NOT_FOUND } from '../../types';

export type Matchers<T> = {
    [K in keyof T]?: (value: T[K], searchTerm: string) => boolean;
};

// TODO Unit test this and break this out into a lib
export const doesTextIncludeCaseInsensitive = (textToSearch: string, textToFind: string): boolean =>
    textToSearch.toLowerCase().includes(textToFind.toLowerCase());

const defaultStringify = (value: unknown): string => {
    if (isNull(value)) return '<null>';

    if (isUndefined(value)) return '<undefined>';

    return String(value);
};

// default to a case-insensitive search
export const defaultMatcher = (value: unknown, searchTerm: string): boolean =>
    doesTextIncludeCaseInsensitive(defaultStringify(value), searchTerm);

export const filterTableData = <T>(
    tableData: (typeof NOT_FOUND | T)[],
    selectedFilterableProperties: (keyof T)[],
    searchTerm: string,
    // We should limit this to matchers for the selected filterable properties
    matchers: Matchers<T> = {}
): T[] => {
    // Do not filter for empty search terms
    if (!isNonEmptyString(searchTerm)) return tableData.filter((r): r is T => r !== NOT_FOUND);

    return tableData.filter(
        (row): row is T =>
            row !== NOT_FOUND &&
            selectedFilterableProperties.some((propertyKey) => {
                const doesValueMatchSearchTerm = matchers[propertyKey] || defaultMatcher;

                const propertyValue = row[propertyKey];

                return doesValueMatchSearchTerm(propertyValue, searchTerm);
            })
    );
};
