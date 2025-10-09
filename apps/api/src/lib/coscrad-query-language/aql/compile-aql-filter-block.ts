import { LanguageCode } from '@coscrad/api-interfaces';
import { isNumber, isPositiveInteger, isString } from '@coscrad/validation-constraints';
import { ResultOrError } from '../../../types/ResultOrError';
import { InternalError, isInternalError } from '../../errors/InternalError';
import {
    InvalidParameterListSizeForQueryOperator,
    InvalidParameterTypeForQueryOperator,
} from '../errors';
import {
    CoscradAndCondition,
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradNotCondition,
    CoscradOrCondition,
    CoscradSimpleCondition,
} from '../models/coscrad-filter-condition';

interface CoscradAqlFilterBlock {
    letStatements?: string;
    statement: string;
    bindVars: Record<string, unknown>;
}

const buildFieldref = (
    docRef: string,
    fieldPath: string,
    startingArgIndex = 0
): {
    expression: string;
    nestedFieldNames: string[];
    isArray: boolean;
} => {
    const nestedFieldNames = fieldPath.split('.');

    const expression = `${docRef}${nestedFieldNames
        .map((_fieldName, fieldIndex) => `[@args[${startingArgIndex + fieldIndex}]]`)
        .join('')}`;

    if (nestedFieldNames.some((f, i) => i !== 0 && f.endsWith('[*]'))) {
        throw new InternalError(
            `Declaring filters nested arrayed-value fields is not yet supported.`
        );
    }

    const isArray = nestedFieldNames[0].endsWith('[*]');

    return {
        expression,
        nestedFieldNames: nestedFieldNames.map((f) => f.replace('[*]', '')), // the `[*]` must be added externally below
        isArray,
    };
};

/**
 * TODO Support nested fields for all query operators.
 */
const forbidNestedFieldQuery = (field: string, operator: CoscradBooleanOperator) => {
    if (field.includes('.') || field.includes('[*]')) {
        throw new InternalError(
            `You cannot use the query operator: ${operator} to filter by nested fields. Recieved field path: ${field}.`
        );
    }
};

const compileSimpleFilterCondition = (
    condition: CoscradSimpleCondition,
    docRef: string,
    startingArgIndex = 0
): ResultOrError<CoscradAqlFilterBlock> => {
    const { operator, params, field } = condition as CoscradSimpleCondition;

    if (operator === CoscradBooleanOperator.GREATER_THAN) {
        if (params.length != 1) {
            return new InvalidParameterListSizeForQueryOperator(1, params, operator);
        }

        const minExclusive = params[0];

        if (!isNumber(minExclusive)) {
            return new InvalidParameterTypeForQueryOperator(
                0,
                minExclusive,
                'non-negative integer',
                operator
            );
        }

        // TODO opt-in
        forbidNestedFieldQuery(field, operator);

        const { expression: fieldRef, nestedFieldNames } = buildFieldref(
            docRef,
            field,
            startingArgIndex
        );

        startingArgIndex += nestedFieldNames.length;

        // field names are provided by the user and must be part of the bindVars
        const statement = `${fieldRef} > @args[${startingArgIndex}]`;

        return {
            statement,
            bindVars: {
                args: [...nestedFieldNames, minExclusive],
            },
        };
    }

    if (operator === CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES) {
        if (params.length == 0 || params.length > 2) {
            return new InvalidParameterListSizeForQueryOperator(2, params, operator);
        }

        if (params.length === 2) {
            throw new Error(`specifying language code is not yet supported`);
        }

        // we know there is only one parameter- the search text
        const searchText = params[0];

        if (!isString(searchText)) {
            return new InvalidParameterTypeForQueryOperator(
                0,
                searchText,
                'non-empty string',
                operator
            );
        }

        if (searchText === '') {
            return {
                statement: '',
                bindVars: {},
            };
        }

        const {
            expression: fieldRef,
            nestedFieldNames,
            isArray,
        } = buildFieldref(docRef, field, startingArgIndex);

        if (!isArray) {
            const statement = `contains(${fieldRef},@args[${
                startingArgIndex + nestedFieldNames.length
            }])`;

            return {
                statement,
                bindVars: {
                    args: [...nestedFieldNames, searchText],
                },
            };
        }

        /**
         * Here we know that:
         * - the top-level field is array valued
         */
        const letStatements = `
            LET matches = (
                for foo in ${docRef}[@args[${startingArgIndex}]]
                filter contains(foo[@args[${startingArgIndex + 1}]],@args[${
            startingArgIndex + nestedFieldNames.length
        }])
                limit 1
                return "match"
            )

            LET hasMatch = LENGTH(matches)>0
        `;

        const statement = `hasMatch`;

        return {
            statement,
            letStatements,
            bindVars: {
                args: [...nestedFieldNames, searchText],
            },
        };
    }

    if (operator === CoscradBooleanOperator.HAS_PROPERTY) {
        if (params.length > 0) {
            return new InvalidParameterListSizeForQueryOperator(0, params, operator);
        }

        // TODO opt-in
        forbidNestedFieldQuery(field, operator);

        // TODO let's deal carefully with `falsey` values here.
        const statement = `has(${docRef},@args[${startingArgIndex}])`;

        return {
            statement,
            bindVars: {
                args: [field],
            },
        };
    }

    if (operator === CoscradBooleanOperator.HAS_LENGTH_GREATER_THAN) {
        if (params.length !== 1) {
            return new InvalidParameterListSizeForQueryOperator(1, params, operator);
        }

        const minLengthExclusive = params[0];

        if (!isPositiveInteger(minLengthExclusive)) {
            return new InvalidParameterTypeForQueryOperator(
                0,
                minLengthExclusive,
                'positive integer',
                operator
            );
        }

        // TODO opt-in
        forbidNestedFieldQuery(field, operator);

        const statement = `length(${docRef}[@args[${startingArgIndex}]]) > @args[${
            startingArgIndex + 1
        }]`;

        return {
            statement,
            bindVars: {
                args: [field, minLengthExclusive],
            },
        };
    }

    if (operator === CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER) {
        if (params.length !== 2) {
            return new InvalidParameterListSizeForQueryOperator(2, params, operator);
        }

        const [letterToFind, languageCode] = params;

        if (!isString(letterToFind)) {
            return new InvalidParameterTypeForQueryOperator(
                0,
                letterToFind,
                'non-empty string',
                CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER
            );
        }

        // TODO `isLanguageCode` ?
        if (!Object.values(LanguageCode).includes(languageCode as LanguageCode)) {
            return new InvalidParameterTypeForQueryOperator(
                1,
                languageCode,
                'Language Code {enum}',
                operator
            );
        }

        // TODO opt-in
        forbidNestedFieldQuery(field, operator);

        const fieldRef = `${docRef}[@args[${startingArgIndex}]]`;

        const letStatements = `
            let matches = (
            for t in ${fieldRef} || []
            filter t.languageCode == @args[${startingArgIndex + 2}]
            for c in t.characters || []
            filter c.text == @args[${startingArgIndex + 1}]
            return c
            )

        `;

        const statement = `
            length(matches) > 0
        `;

        return {
            letStatements,
            // TODO rename this `filterStatement`?
            statement,
            bindVars: {
                args: [field, letterToFind, languageCode],
            },
        };
    }

    throw new InternalError(`Unsupported logical operator for COSCRAD query filter: ${operator}`);
};

const compileAndFilterCondition = (
    condition: CoscradAndCondition,
    docRef: string,
    startingArgIndex = 0
) => {
    const { conditions } = condition;

    if (conditions.some((c) => c.type !== CoscradConditionBlockType.SIMPLE)) {
        throw new InternalError(
            `Nesting of complex queries is not yet supported.\n An AND query may only take simple conditions.`
        );
    }

    const { context: bindVars, statements } = conditions.reduce(
        (acc, condition) => {
            const { statements, context, index } = acc;

            const compileResult = compileSimpleFilterCondition(condition, docRef, index);

            if (isInternalError(compileResult)) {
                throw new InternalError(
                    `Failed to compile sub-query as part of an and-cluase in COSCRAD filter query`,
                    [compileResult]
                );
            }

            const { bindVars, statement } = compileResult;

            statements.push(statement);

            // TODO Do we want type safety \ static key consistency
            context.args.push(...(bindVars['args'] as unknown[]));

            const newStartingIndex = index + (bindVars['args'] as unknown[]).length;

            return {
                statements,
                context,
                index: newStartingIndex,
            };
        },
        { context: { args: [] }, statements: [], index: startingArgIndex } as {
            context: { args: unknown[] };
            statements: string[];
            index: number;
        }
    );

    return {
        bindVars,
        /**
         * TODO Is there a computational difference between
         * ```aql
         * filter conditionA
         * filter conditionB
         * filter conditionC
         * ``
         * vs.
         * filter a && b && c
         * in AQL
         */
        statement: statements.join(' and '),
    };
};

const compileOrFilterCondition = (
    condition: CoscradOrCondition,
    docRef: string,
    startingArgIndex = 0
) => {
    const { conditions } = condition;

    if (conditions.some((c) => c.type !== CoscradConditionBlockType.SIMPLE)) {
        throw new InternalError(
            `Nesting of complex queries is not yet supported.\n An AND query may only take simple conditions.`
        );
    }

    const { context: bindVars, statements } = conditions.reduce(
        (acc, condition) => {
            const { statements, context, index } = acc;

            const compileResult = compileSimpleFilterCondition(condition, docRef, index);

            if (isInternalError(compileResult)) {
                throw new InternalError(
                    `Failed to compile sub-query as part of an and-cluase in COSCRAD filter query`,
                    [compileResult]
                );
            }

            const { bindVars, statement } = compileResult;

            statements.push(statement);

            // TODO Do we want type safety \ static key consistency
            context.args.push(...(bindVars['args'] as unknown[]));

            const newStartingIndex = index + (bindVars['args'] as unknown[]).length;

            return {
                statements,
                context,
                index: newStartingIndex,
            };
        },
        { context: { args: [] }, statements: [], index: startingArgIndex } as {
            context: { args: unknown[] };
            statements: string[];
            index: number;
        }
    );

    return {
        bindVars,
        statement: statements.join(' or '),
    };
};

const compileNotFilterCondition = (
    condition: CoscradNotCondition,
    docRef: string,
    startingArgIndex = 0
): ResultOrError<CoscradAqlFilterBlock> => {
    // TODO the naming is a bit off
    if (condition.condition.type !== CoscradConditionBlockType.SIMPLE) {
        throw new InternalError(
            `Complex sub-queries with logical negation (NOT) are not yet supported.`
        );
    }

    const childCompileResult = compileSimpleFilterCondition(
        condition.condition,
        docRef,
        startingArgIndex
    );

    if (isInternalError(childCompileResult)) {
        return new InternalError(`Encountered a NOT block with an invalid child condition.`, [
            childCompileResult,
        ]);
    }

    const { statement: childStatement, bindVars } = childCompileResult;

    const negatedStatement = `!(${childStatement})`;

    return {
        statement: negatedStatement,
        bindVars,
    };
};

export const compileAqlFilterBlock = (
    condition: CoscradFilterCondition,
    /**
     * Never build this dynamically from user input or else you could expose AQL injection.
     */
    docRef: string,
    startingArgIndex = 0
    // options? e.g., case-insensitive
): ResultOrError<CoscradAqlFilterBlock> => {
    // TODO schmea-based type validation for the object?

    const { type } = condition;

    if (type === CoscradConditionBlockType.SIMPLE) {
        const result = compileSimpleFilterCondition(
            // TODO typeguard?
            condition as CoscradSimpleCondition,
            docRef,
            startingArgIndex
        );

        return result;
    }

    if (type === CoscradConditionBlockType.AND) {
        const result = compileAndFilterCondition(condition as CoscradAndCondition, docRef, 0);

        return result;
    }

    if (type === CoscradConditionBlockType.OR) {
        const result = compileOrFilterCondition(condition as CoscradOrCondition, docRef, 0);

        return result;
    }

    if (type === CoscradConditionBlockType.NOT) {
        const result = compileNotFilterCondition(condition as CoscradNotCondition, docRef, 0);

        return result;
    }

    throw new InternalError(`Unsupported COSCRAD filter condition type: ${type}`);
};
