import { isNumber, isPositiveInteger, isString } from '@coscrad/validation-constraints';
import { ResultOrError } from '../../../types/ResultOrError';
import { InternalError, isInternalError } from '../../errors/InternalError';
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

const compileSimpleFilterCondition = (
    condition: CoscradSimpleCondition,
    docRef: string,
    startingArgIndex = 0
): ResultOrError<CoscradAqlFilterBlock> => {
    const { operator, params, field } = condition as CoscradSimpleCondition;

    if (operator === CoscradBooleanOperator.GREATER_THAN) {
        if (params.length != 1) {
            throw new Error(`todo returned error test case`);
        }

        const minExclusive = params[0];

        if (!isNumber(minExclusive)) {
            throw new Error(`todo return param type user input error`);
        }

        // field names are provided by the user and must be part of the bindVars
        const statement = `${docRef}[@args[${startingArgIndex}]] > @args[${startingArgIndex + 1}]`;

        return {
            statement,
            bindVars: {
                args: [field, minExclusive],
            },
        };
    }

    if (operator === CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES) {
        if (params.length == 0 || params.length > 2) {
            throw new Error(`todo return error for param length`);
        }

        if (params.length === 2) {
            throw new Error(`specifying language code is not yet supported`);
        }

        // we know there is only one parameter- the search text
        const searchText = params[0];

        if (!isString(searchText)) {
            throw new Error(`Invalid param type`);
        }

        if (searchText === '') {
            return {
                statement: '',
                bindVars: {},
            };
        }

        const statement = `contains(${docRef}[@args[${startingArgIndex}]],@args[${
            startingArgIndex + 1
        }])`;

        return {
            statement,
            bindVars: {
                args: [field, searchText],
            },
        };
    }

    if (operator === CoscradBooleanOperator.HAS_PROPERTY) {
        if (params.length > 0) {
            throw new InternalError(
                `Expected 0 parameters for operator HAS_PROPERTY. Received: ${params}`
            );
        }

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
            throw new InternalError(
                `Expected exactly one paramter of type [number] for operator HAS_LENGTH_GREATER_THAN`
            );
        }

        const minLengthExclusive = params[0];

        if (!isPositiveInteger(minLengthExclusive)) {
            throw new InternalError(`TODO return me`);
        }

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
            throw new InternalError(
                `Expected exactly two parameters of type [number, str (LanguageCode)]. Received: ${params}`
            );
        }

        const [letterToFind, languageCode] = params;

        if (!isString(letterToFind)) {
            throw new InternalError(`TODO return me!`);
        }

        // TODO `isLanguageCode` ?
        if (!isString(languageCode)) {
            throw new InternalError(`TODO return this error- invalid param`);
        }

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
        statement: statements.join('\n'),
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
        throw new InternalError(`TODO make this a bad user input returned error`, [
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
