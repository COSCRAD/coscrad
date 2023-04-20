/* eslint-disable-next-line */
// import { IMultilingualText, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import {
    isBoolean,
    isFiniteNumber,
    isInteger,
    isISBN,
    isNonEmptyString,
    isNonNegativeNumber,
    isNullOrUndefined,
    isObject,
    isPositiveInteger,
    isString,
    isURL,
    isUUID,
    isYear,
} from '../constraints';
import { CoscradConstraint } from '../constraints/coscrad-constraint.enum';
import { isFunction } from '../constraints/is-function';
import { PredicateFunction } from '../types';

/**
 * We reapeat the following definitions to avoid circular dependencies. This is
 * probably a sign that our approach to validating multilingual text via
 * constraints is not quite the correct pattern to use.
 */
enum LanguageCode {
    Chilcotin = 'clc',
    Haida = 'hai',
    English = 'eng',
    French = 'fra',
    Chinook = 'chn',
    Zapotec = 'zap',
    Spanish = 'spa',
}

enum MultilingualTextItemRole {
    original = 'original',
    glossedTo = 'glossed to',
    prompt = 'prompt', // e.g., "How do you say?"
    freeTranslation = 'free translation',
    literalTranslation = 'literal translation',
}

interface IMultlingualTextItem {
    languageCode: LanguageCode;

    text: string;

    role: MultilingualTextItemRole;
}

interface IMultilingualText {
    items: IMultlingualTextItem[];
}

const constraintsLookupTable: { [K in CoscradConstraint]: PredicateFunction } = {
    [CoscradConstraint.isNonEmptyString]: isNonEmptyString,
    [CoscradConstraint.isBoolean]: isBoolean,
    [CoscradConstraint.isRequired]: (input: unknown) => !isNullOrUndefined(input),
    [CoscradConstraint.isInteger]: isInteger,
    [CoscradConstraint.isObject]: isObject,
    [CoscradConstraint.isYear]: isYear,
    [CoscradConstraint.isUUID]: (input: unknown): input is string =>
        isString(input) && isUUID(input),
    [CoscradConstraint.isISBN]: (input: unknown): input is string =>
        isString(input) && isISBN(input),
    [CoscradConstraint.isNonNegative]: isNonNegativeNumber,
    [CoscradConstraint.isFiniteNumber]: isFiniteNumber,
    [CoscradConstraint.isPositive]: isPositiveInteger,
    [CoscradConstraint.isURL]: isURL,
    [CoscradConstraint.isString]: isString,
    [CoscradConstraint.isCompositeIdentifier]: (input: unknown) => {
        const { type, id } = input as { type: string; id: string };

        // TODO Make the id a `UUID`
        return [type, id].every(isNonEmptyString);
    },
    /**
     * TODO This is a hack. We decided that the complexity of dynamically
     * generating nested forms was too much. Instead, we decided to make
     * `CoscradMultilingualText` a `CoscradDataType` and hard-wire the form
     * on the front-end.
     *
     * A down-side of this approach is that constraint-based validation
     * requires implementing simple-invariant validation here without recourse
     * to our class annotations. If we are going to take this approach, we
     * should export the nested entity class from this lib into the back-end
     * instead.
     */
    [CoscradConstraint.isMultilingualText]: (input: unknown) => {
        if (isNullOrUndefined(input)) return false;

        const { items } = input as IMultilingualText;

        if (!Array.isArray(items)) return false;

        const invalidItems = items.filter(
            ({ languageCode, role, text }) =>
                !Object.values(LanguageCode).includes(languageCode) ||
                !Object.values(MultilingualTextItemRole).includes(role) ||
                !isNonEmptyString(text)
        );

        return invalidItems.length === 0;
    },
};

export const isConstraintSatisfied = (
    constraintName: CoscradConstraint,
    value: unknown
): boolean => {
    /**
     * This is a hack. Currently, we don't register `IS_ENUM` as a proper
     * constraint because it requires parameters (the allowed values).
     * However, we render dynamic selections for these values, so the only
     * constraint that needs to be validated client side is that the selection
     * is not null if the field is required.
     */
    if (constraintName === ('IS_ENUM' as CoscradConstraint)) {
        return true;
    }

    const predicateFunction = constraintsLookupTable[constraintName];

    if (!isFunction(predicateFunction))
        throw new Error(`Cannot validate unknown constraint: ${constraintName}`);

    return predicateFunction(value);
};
