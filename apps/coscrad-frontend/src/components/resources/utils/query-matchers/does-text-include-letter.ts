import { IMultilingualTextItem } from '@coscrad/api-interfaces';

export const doesTextIncludeLetter = (
    { tokens }: IMultilingualTextItem,
    letter: string
): boolean => {
    if (!Array.isArray(tokens)) {
        throw new Error(`missing tokens case not implemented`);
    }

    // return tokens.some(
    //     ({}) =>
    // )
};
