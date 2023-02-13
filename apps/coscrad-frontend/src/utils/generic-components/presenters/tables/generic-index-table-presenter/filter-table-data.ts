import { isNonEmptyString } from '@coscrad/validation-constraints';

export type Matchers<T> = {
    [K in keyof T]?: (value: T[K], searchTerm: string) => boolean;
};

// default to a case-insensitive search
const defaultMatcher = (value: unknown, searchTerm: string): boolean =>
    String(value).toLowerCase().includes(searchTerm.toLowerCase());

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
