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

// This is a hack. How should we handle this?
let varCount = 0;

interface CoscradAqlFilterBlock {
    letStatement?: string;
    filterStatement: string;
    bindVars: Record<string, unknown>;
}

const buildFieldRef = (
    docRef: string,
    fieldPath: string,
    startingArgIndex = 0
): {
    expression: string;
    individualFieldNames: string[];
    isArray: boolean;
} => {
    const nestedFieldNames = fieldPath.split('.');

    const expression = `${docRef}${nestedFieldNames
        .map((_fieldName, fieldIndex) => `[@args[${startingArgIndex + fieldIndex}]]`)
        .join('')}`;

    const isArray = nestedFieldNames[0].endsWith('[*]');

    return {
        expression,
        individualFieldNames: nestedFieldNames.map((f) => f.replace('[*]', '')), // the `[*]` must be added externally below
        isArray,
    };
};

const forbidArrayValuedFieldQuery = (field: string, operator: CoscradBooleanOperator) => {
    if (field.includes('[*]')) {
        throw new InternalError(
            `You cannot use the query operator: ${operator} to filter arrays. Received field path: ${field}`
        );
    }
};

/**
 * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-330] Support nested fields for all query operators.
 */
const forbidNestedFieldQuery = (field: string, operator: CoscradBooleanOperator) => {
    forbidArrayValuedFieldQuery(field, operator);

    if (field.includes('.')) {
        throw new InternalError(
            `You cannot use the query operator: ${operator} to filter by nested fields. Received field path: ${field}.`
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

        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-330] opt-in
        forbidNestedFieldQuery(field, operator);

        const { expression: fieldRef, individualFieldNames } = buildFieldRef(
            docRef,
            field,
            startingArgIndex
        );

        startingArgIndex += individualFieldNames.length;

        // field names are provided by the user and must be part of the bindVars
        const statement = `${fieldRef} > @args[${startingArgIndex}]`;

        return {
            filterStatement: statement,
            bindVars: {
                args: [...individualFieldNames, minExclusive],
            },
        };
    }

    if (operator === CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES) {
        if (params.length == 0 || params.length > 2) {
            return new InvalidParameterListSizeForQueryOperator(2, params, operator);
        }

        // We always need a first parameter
        const searchText = params[0];

        if (!isString(searchText)) {
            return new InvalidParameterTypeForQueryOperator(
                0,
                searchText,
                'non-empty string',
                operator
            );
        }

        const {
            expression: fieldRef,
            individualFieldNames,
            isArray,
        } = buildFieldRef(docRef, field, startingArgIndex);

        if (params.length === 2) {
            const languageCode = params[1];

            /**
             * If the text is empty, we return all resources who have a
             * multilingual text item in this language for the given field.
             */
            if (searchText === '') {
                if (isArray) {
                    const filterStatement = `contains(${fieldRef}[*].items[*].languageCode,@args[${
                        startingArgIndex + individualFieldNames.length
                    }])`;

                    return {
                        filterStatement,
                        bindVars: { args: [...individualFieldNames, languageCode] },
                    };
                }

                const letVarName = `matches_${++varCount}`;

                const letStatement = `
                let ${letVarName} = (
                    for i in ${fieldRef}.items
                    filter i.languageCode == @args[${
                        startingArgIndex + individualFieldNames.length + 1
                    }]
                    limit 1
                    return "match"
                )
                `;

                const statement = `length(${letVarName}) > 0`;

                return {
                    letStatement,
                    filterStatement: statement,
                    bindVars: { args: [...individualFieldNames, searchText, languageCode] },
                };
            }

            /**
             * We need to ensure that this is globally unique, otherwise
             * we will get odd results due to multiple blocks
             * modifying the same scope.
             */
            const letVarName = `matches_${++varCount}`;

            if (!isArray) {
                const letStatement = `
                let ${letVarName} = (
                    for i in ${fieldRef}.items
                    filter contains(i.text,@args[${
                        startingArgIndex + individualFieldNames.length
                    }]) 
                    and i.languageCode == @args[${
                        startingArgIndex + individualFieldNames.length + 1
                    }]
                    return "match"
                )
                `;

                const statement = `length(${letVarName}) > 0`;

                return {
                    letStatement,
                    filterStatement: statement,
                    bindVars: { args: [...individualFieldNames, searchText, languageCode] },
                };
            }

            // We have 2 parameters (search text, language code) and the field is an array of ML Text items
            throw new InternalError(
                `Searching a list of multilingual text values is not yet supported via COSCRAD query language.`
            );
        }

        // we know there is only one parameter- the search text
        if (searchText === '') {
            return {
                filterStatement: '',
                bindVars: {},
            };
        }

        if (!isArray) {
            const statement = `contains(${fieldRef},@args[${
                startingArgIndex + individualFieldNames.length
            }])`;

            return {
                filterStatement: statement,
                bindVars: {
                    args: [...individualFieldNames, searchText],
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
            startingArgIndex + individualFieldNames.length
        }])
                limit 1
                return "match"
            )

            LET hasMatch = LENGTH(matches)>0
        `;

        const statement = `hasMatch`;

        return {
            filterStatement: statement,
            letStatement: letStatements,
            bindVars: {
                args: [...individualFieldNames, searchText],
            },
        };
    }

    if (operator === CoscradBooleanOperator.HAS_PROPERTY) {
        if (params.length > 0) {
            return new InvalidParameterListSizeForQueryOperator(0, params, operator);
        }

        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-330] opt-in
        forbidNestedFieldQuery(field, operator);

        const statement = `has(${docRef},@args[${startingArgIndex}])`;

        return {
            filterStatement: statement,
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

        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-330] opt-in
        forbidNestedFieldQuery(field, operator);

        const statement = `length(${docRef}[@args[${startingArgIndex}]]) > @args[${
            startingArgIndex + 1
        }]`;

        return {
            filterStatement: statement,
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

        if (!Object.values(LanguageCode).includes(languageCode as LanguageCode)) {
            return new InvalidParameterTypeForQueryOperator(
                1,
                languageCode,
                'Language Code {enum}',
                operator
            );
        }

        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-330] opt-in
        forbidNestedFieldQuery(field, operator);

        const fieldRef = `${docRef}[@args[${startingArgIndex}]]`;

        // TODO expose this option
        const IGNORE_CASE = true;

        const matchVarName = `matches_${++varCount}`;

        const letStatements = `
            let ${matchVarName} = (
            for t in ${fieldRef} || []
            filter t.languageCode == @args[${startingArgIndex + 2}]
            for c in t.characters || []
            let textForComparison = ${
                IGNORE_CASE
                    ? `lower(@args[${startingArgIndex + 1}])`
                    : `@args[${startingArgIndex + 1}]`
            }
            filter c.text == textForComparison && !c.isOutOfAlphabet
            return c
            )

        `;

        const statement = `
            length(${matchVarName}) > 0
        `;

        return {
            letStatement: letStatements,
            filterStatement: statement,
            bindVars: {
                args: [
                    field,
                    IGNORE_CASE ? letterToFind.toLowerCase() : letterToFind,
                    languageCode,
                ],
            },
        };
    }

    if (operator === CoscradBooleanOperator.TEXT_INCLUDES) {
        if (params.length !== 1) {
            return new InvalidParameterListSizeForQueryOperator(1, params, operator);
        }

        const searchText = params[0];

        if (!isString(searchText)) {
            return new InvalidParameterTypeForQueryOperator(0, searchText, 'text', operator);
        }

        const {
            expression: fieldRef,
            individualFieldNames,
            isArray,
        } = buildFieldRef(docRef, field, startingArgIndex);

        const matchVarName = `matches_${++varCount}`;

        if (isArray) {
            const letStatement = `
            let ${matchVarName} = (
                for item in ${docRef}.${field}
                filter contains(item,@args[${startingArgIndex + 1}])
                limit 1
                return "match"
            )
            `;

            const filterStatement = `
            length(${matchVarName}) > 0
            `;

            return {
                letStatement,
                filterStatement,
                bindVars: {
                    args: [field, searchText],
                },
            };
        }

        if (individualFieldNames.length > 1) {
            throw Error(`we need to support nested text searches`);
        }

        const filterStatement = `
        contains(${fieldRef},@args[${startingArgIndex + 1}])
        `;

        return {
            filterStatement,
            bindVars: {
                args: [field, searchText],
            },
        };
    }

    if (operator === CoscradBooleanOperator.TEXT_EQUALS) {
        if (params.length !== 1) {
            return new InvalidParameterListSizeForQueryOperator(1, params, operator);
        }

        const textToMatch = params[0];

        if (!isString(textToMatch)) {
            return new InvalidParameterTypeForQueryOperator(0, textToMatch, 'text', operator);
        }

        const {
            expression: fieldRef,
            isArray,
            individualFieldNames,
        } = buildFieldRef(docRef, field, startingArgIndex);

        if (isArray) {
            const filterStatement = `
            @args[${startingArgIndex + 1}] in ${fieldRef}[*]
            `;

            return {
                filterStatement,
                bindVars: {
                    args: [individualFieldNames[0], textToMatch],
                },
            };
        }

        if (individualFieldNames.length > 1) {
            const numberOfArrayRefs = individualFieldNames.filter((n) => n.includes('[*]')).length;

            if (numberOfArrayRefs > 1) {
                throw new InternalError(
                    `Deeply nested arrays are not supported for operator: ${operator}. Received: ${field}`
                );
            }

            /**
             * TODO We need to either
             * 1. bind in the field
             * 2. validate the field against the schema (use a known props list approach)
             * to ensure we avoid injection attacks
             */
            const filterStatement = `
                   @args[${startingArgIndex + 1}] in ${docRef}.${field}
                    `;

            return {
                filterStatement,
                bindVars: {
                    args: [field, textToMatch],
                },
            };
        }

        const filterStatement = `
            ${fieldRef} == @args[${startingArgIndex + 1}]
        `;

        return {
            filterStatement,
            bindVars: {
                args: [field, textToMatch],
            },
        };
    }

    if (operator === CoscradBooleanOperator.USER_CAN) {
        const {
            expression: fieldRef,
            individualFieldNames,
            isArray,
        } = buildFieldRef(docRef, field, startingArgIndex);

        if (isArray) {
            throw new Error(`Arrays of Access Control Lists are not allowed`);
        }

        if (individualFieldNames.length > 1) {
            throw new Error(`Nested Access Control Lists are not yet supported`);
        }

        if (individualFieldNames[0] !== 'accessControlList') {
            throw new Error(
                `We currently only support filtering for user access via a top-level 'accessControlList' property`
            );
        }

        // TODO validate param list

        const [userId, groupIds] = params;

        const letVarName = `acl_${varCount}`;

        const letStatement = `
        let ${letVarName} = has(${docRef},'${individualFieldNames.join(
            '.'
        )}') ? ${fieldRef} : { allowedUserIds: [], allowedGroupIds: [] }
        `;

        const filterStatement = `contains(${letVarName}.allowedUserIds,@args[${
            startingArgIndex + 1
        }]) || length(intersection(${letVarName}.allowedGroupIds,@args[${
            startingArgIndex + 2
        }])) > 0`;

        return {
            letStatement,
            filterStatement,
            bindVars: {
                args: [field, userId, groupIds],
            },
        };
    }

    if (operator === CoscradBooleanOperator.IS_FLAGGED) {
        const {
            expression: fieldRef,
            individualFieldNames,
            isArray,
        } = buildFieldRef(docRef, field, startingArgIndex);

        if (isArray) {
            // TODO make this a returned error
            throw new Error(`Arrays of flags are not supported for operator IS_FLAGGED`);
        }

        const filterStatement = `
        has(${docRef},'${individualFieldNames.join('.')}') && ${fieldRef}
        `;

        return {
            filterStatement,
            bindVars: {
                args: [field],
            },
        };
    }

    throw new InternalError(`Unsupported logical operator for COSCRAD query filter: ${operator}`);
};

const compileAndFilterCondition = (
    condition: CoscradAndCondition,
    docRef: string,
    startingArgIndex = 0
): ResultOrError<CoscradAqlFilterBlock> => {
    const { conditions } = condition;

    const {
        context: bindVars,
        statements,
        letStatements,
    } = conditions.reduce(
        (acc, condition) => {
            const { statements, letStatements, context, index } = acc;

            if (
                condition.type !== CoscradConditionBlockType.SIMPLE &&
                condition.type !== CoscradConditionBlockType.OR
            ) {
                throw new Error(
                    `Child condition of type: ${condition.type} is not yet supported within an AND block`
                );
            }

            const compileResult = compileAqlFilterBlock(condition, docRef, index);

            if (isInternalError(compileResult)) {
                throw new InternalError(
                    `Failed to compile sub-query as part of an and-cluase in COSCRAD filter query`,
                    [compileResult]
                );
            }

            const { bindVars, filterStatement: statement, letStatement } = compileResult;

            statements.push(statement);

            letStatements.push(letStatement);

            context.args.push(...(bindVars['args'] as unknown[]));

            const newStartingIndex = index + (bindVars['args'] as unknown[]).length;

            return {
                statements,
                letStatements,
                context,
                index: newStartingIndex,
            };
        },
        { context: { args: [] }, statements: [], letStatements: [], index: startingArgIndex } as {
            context: { args: unknown[] };
            statements: string[];
            letStatements: string[];
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
         * ```
         * vs.
         * ```aql
         * filter a && b && c
         * in AQL
         * ```
         */
        letStatement: letStatements.join('\n'),
        filterStatement: statements.join(' and '),
    };
};

const compileOrFilterCondition = (
    condition: CoscradOrCondition,
    docRef: string,
    startingArgIndex = 0
): ResultOrError<CoscradAqlFilterBlock> => {
    const { conditions } = condition;

    if (conditions.some((c) => c.type !== CoscradConditionBlockType.SIMPLE)) {
        throw new InternalError(
            `Nesting of complex queries is not yet supported.\n An OR query may only take simple conditions. Received: ${JSON.stringify(
                conditions
            )}`
        );
    }

    const {
        context: bindVars,
        filterStatements,
        letStatements,
    } = conditions.reduce(
        (acc, condition) => {
            const { filterStatements, letStatements, context, index } = acc;

            const compileResult = compileSimpleFilterCondition(condition, docRef, index);

            if (isInternalError(compileResult)) {
                throw new InternalError(
                    `Failed to compile sub-query as part of an and-cluase in COSCRAD filter query`,
                    [compileResult]
                );
            }

            const { bindVars, filterStatement: statement, letStatement } = compileResult;

            filterStatements.push(statement);

            letStatements.push(letStatement);

            if (!Array.isArray(bindVars['args'])) {
                throw new InternalError(
                    `Encountered invalidly parsed bindVars: ${JSON.stringify({
                        bindVars,
                        condition,
                        docRef,
                        index,
                    })}`
                );
            }

            context.args.push(...(bindVars['args'] as unknown[]));

            const newStartingIndex = index + (bindVars['args'] as unknown[]).length;

            return {
                filterStatements,
                letStatements,
                context,
                index: newStartingIndex,
            };
        },
        {
            context: { args: [] },
            filterStatements: [],
            letStatements: [],
            index: startingArgIndex,
        } as {
            context: { args: unknown[] };
            filterStatements: string[];
            letStatements: string[];
            index: number;
        }
    );

    return {
        bindVars,
        filterStatement: filterStatements.join(' or '),
        letStatement: letStatements.join('\n'),
    };
};

const compileNotFilterCondition = (
    condition: CoscradNotCondition,
    docRef: string,
    startingArgIndex = 0
): ResultOrError<CoscradAqlFilterBlock> => {
    // TODO should we rename this `block.condition` instead?
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

    const { filterStatement: childStatement, bindVars } = childCompileResult;

    const negatedStatement = `!(${childStatement})`;

    return {
        filterStatement: negatedStatement,
        bindVars,
    };
};

export const compileAqlFilterBlockHelper = (
    condition: CoscradFilterCondition,
    /**
     * Never build this dynamically from user input or else you could expose AQL injection.
     */
    docRef: string,
    startingArgIndex = 0
    // options? e.g., case-insensitive
): ResultOrError<CoscradAqlFilterBlock> => {
    const { type } = condition;

    if (type === CoscradConditionBlockType.SIMPLE) {
        const result = compileSimpleFilterCondition(
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

export const compileAqlFilterBlock = (
    condition: CoscradFilterCondition,
    /**
     * Never build this dynamically from user input or else you could expose AQL injection.
     */
    docRef: string,
    startingArgIndex = 0
    // options? e.g., case-insensitive
): ResultOrError<CoscradAqlFilterBlock> => {
    const result = compileAqlFilterBlockHelper(condition, docRef, startingArgIndex);

    /**
     * This is a hack. We need to find a better way to deal with generating
     * unique names for `let` vars in Arango queries. Note that these are not
     * bind vars, as they are not built from user input directly.
     */
    varCount = 0;

    return result;
};
