import { isFunction, isNonEmptyObject, isPrimitiveType } from '@coscrad/validation-constraints';
import { ITextStandardizerProvider, MultilingualText } from './multilingual-text';

export const deepStandardizeMultilingualText = <T>(
    standardizerProvider: ITextStandardizerProvider,
    target: T
): T => {
    /**
     * We walk the object property tree and when we hit a multilingual text
     * valued prop, we replace it in-place with its standardization. There is
     * no need for immutability here, because this is a last transformation
     * before sending a response to a client over the wire. There are no
     * risks of shared references causing problems.
     */
    if (target instanceof MultilingualText) {
        return target.standardize(standardizerProvider);
    }

    if (isPrimitiveType(target)) {
        return target;
    }

    if (Array.isArray(target)) {
        return target.map((v) => deepStandardizeMultilingualText(standardizerProvider, v)) as T;
    }

    // is this necessary?
    if (isFunction(target)) {
        return target;
    }

    if (isNonEmptyObject(target)) {
        return Object.entries(target).reduce((accumulatedObject, [propertyKey, propertyValue]) => {
            accumulatedObject[propertyKey] = deepStandardizeMultilingualText(
                standardizerProvider,
                propertyValue
            );

            return accumulatedObject;
        }, {} as T);
    }

    return target; // at this point, we know `target` is {}
};
