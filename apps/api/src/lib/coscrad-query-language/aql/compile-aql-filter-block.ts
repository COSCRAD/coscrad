import { isNumber, isString } from '@coscrad/validation-constraints';
import { ResultOrError } from '../../../types/ResultOrError';
import { InternalError, isInternalError } from '../../errors/InternalError';
import {
    CoscradAndCondition,
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradSimpleCondition,
} from '../models/coscrad-filter-condition';

interface CoscradAqlFilterBlock {
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
        const statement = `filter ${docRef}[@args[${startingArgIndex}]] > @args[${
            startingArgIndex + 1
        }]`;

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

        const statement = `filter contains(${docRef}[@args[${startingArgIndex}]],@args[${
            startingArgIndex + 1
        }])`;

        return {
            statement,
            bindVars: {
                args: [field, searchText],
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

    if (type == CoscradConditionBlockType.SIMPLE) {
        return compileSimpleFilterCondition(
            // TODO typeguard?
            condition as CoscradSimpleCondition,
            docRef,
            startingArgIndex
        );
    }

    if (type == CoscradConditionBlockType.AND) {
        const result = compileAndFilterCondition(condition as CoscradAndCondition, docRef, 0);

        return result;
    }

    throw new InternalError(`Unsupported COSCRAD filter condition type: ${type}`);
};
