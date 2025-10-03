import { InternalError } from '../../errors/InternalError';

export enum CoscradBooleanOperator {
    AND = 'AND',
    OR = 'OR',
}

export enum CoscradLogicalOperator {
    MULTILINGUAL_TEXT_INCLUDES = 'MULTILINGUAL_TEXT_INCLUDES',
    GREATER_THAN = 'GREATER_THAN',
}

class CoscradQueryCondition<T = string | boolean | number> {
    operator: CoscradLogicalOperator;
    field: string;
    queryParams: T[];
}

export class CoscradUserQuery {
    operator: CoscradBooleanOperator;
    conditions: CoscradQueryCondition[];
}

type FilterStatementAndBindVars = {
    filter: string;
    bindVars: Record<string, unknown>;
};

// TODO lookup table?
const getKeywordForOperator = (operator: CoscradBooleanOperator): string => {
    if (operator === CoscradBooleanOperator.AND) {
        return 'and';
    }

    if (operator === CoscradBooleanOperator.OR) {
        return 'or';
    }

    const exhaustiveCheck: never = operator;

    throw new InternalError(
        `Encountered an unsupported operator in user query: ${exhaustiveCheck}`
    );
};

// TODO return error?
const convertConditionsToExpression = (
    condition: CoscradQueryCondition,
    nextIndex: number
): { expression: string; bindVars: unknown[] } => {
    const { operator, field, queryParams } = condition;

    if (operator === CoscradLogicalOperator.MULTILINGUAL_TEXT_INCLUDES) {
        // TODO fix this
        const queryString = queryParams[0];

        // TODO inject doc reference
        const expression = `CONTAINS(doc[@args[${nextIndex}]].items[*],@args[${nextIndex + 1}])`;

        return {
            expression,
            bindVars: [field, queryString],
        };
    }

    if (operator === CoscradLogicalOperator.GREATER_THAN) {
        const argument = queryParams[0];

        const expression = `
        IS_NUMBER(@args[${nextIndex + 1}]) ? doc[@args[${nextIndex}]] > @args[${
            nextIndex + 1
        }] : LENGTH(doc[@args[${nextIndex}]]) > @args[${nextIndex + 1}]
        `;

        return {
            expression,
            bindVars: [field, argument],
        };
    }

    const exhaustiveCheck: never = operator;

    throw new InternalError(`Unsupported COSCRAD query operator: ${exhaustiveCheck}`);
};

/**
 * TODO Move this to the database layer
 */
export const compileAqlFilterStatement = (query: CoscradUserQuery): FilterStatementAndBindVars => {
    const { operator, conditions } = query;

    /**
     * Note that this has been validate against an enum
     */
    const keyword = getKeywordForOperator(operator);

    const filtersAndBindVars = conditions.map(convertConditionsToExpression);

    return {
        filter: filtersAndBindVars.map(({ expression }) => expression).join(` ${keyword} `),
        bindVars: filtersAndBindVars.reduce(
            (acc, { bindVars }) => {
                acc.args.push(...bindVars);

                return acc;
            },
            {
                args: [],
            }
        ),
    };
};
