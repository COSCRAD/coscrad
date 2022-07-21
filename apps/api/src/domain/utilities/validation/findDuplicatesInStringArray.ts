type UniqueAndDuplicates<T> = {
    unique: T[];

    duplicates: T[];
};

/**
 * TODO: Generalize this and extract to a higher level.
 */
const buildEmptyUniqueAndDuplicatesInstance = <T>(): UniqueAndDuplicates<T> => ({
    unique: [],
    duplicates: [],
});

export default (input: string[]): string[] =>
    input.reduce(({ unique, duplicates }: UniqueAndDuplicates<string>, element) => {
        // Repeat duplicate- don't add to the list
        if (duplicates.includes(element))
            return {
                unique,
                duplicates,
            };

        // Newly identified duplicate- add to list
        if (unique.includes(element))
            return {
                unique,
                // TODO use deep clone if taking in non-primitive type of data
                duplicates: [...duplicates, element],
            };

        // the element is unique
        return {
            // TODO use deep clone if taking in non-primitive type of data
            unique: [...unique, element],
            duplicates,
        };
    }, buildEmptyUniqueAndDuplicatesInstance<string>()).duplicates;
