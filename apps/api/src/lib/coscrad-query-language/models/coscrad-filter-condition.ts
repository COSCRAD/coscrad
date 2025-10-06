export enum CoscradConditionBlockType {
    OR = 'OR',
    AND = 'AND',
    NOT = 'NOT',
    SIMPLE = 'SIMPLE',
}

export enum CoscradBooleanOperator {
    GREATER_THAN = 'GREATER_THAN',
    MULTILINGUAL_TEXT_INCLUDES = 'MULTILINGUAL_TEXT_INCLUDES',
}

interface CoscradCoditionBlock {
    type: CoscradConditionBlockType;
}

type CoscradUserQueryParams = string | number;

export class CoscradSimpleCondition implements CoscradCoditionBlock {
    type = CoscradConditionBlockType.SIMPLE;

    field: string;

    operator: CoscradBooleanOperator;

    params: CoscradUserQueryParams[];
}

export class CoscradOrCondition implements CoscradCoditionBlock {
    type = CoscradConditionBlockType.OR;

    conditions: CoscradSimpleCondition[];
}

export class CoscradAndCondition implements CoscradCoditionBlock {
    type = CoscradConditionBlockType.OR;

    conditions: CoscradSimpleCondition[];
}

export class CoscradNotCondition implements CoscradCoditionBlock {
    type = CoscradConditionBlockType.OR;

    condition: CoscradSimpleCondition;
}

export type CoscradFilterCondition =
    | CoscradAndCondition
    | CoscradOrCondition
    | CoscradNotCondition
    | CoscradSimpleCondition;

// const pageLengthGreaterThan10: CoscradSimpleCondition = {
//     type: CoscradConditionBlockType.SIMPLE,
//     field: 'size',
//     operator: CoscradBooleanOperator.GREATER_THAN,
//     params: [10],
// };

// const mlTextIncludes: CoscradSimpleCondition = {
//     type: CoscradConditionBlockType.SIMPLE,
//     field: 'name',
//     operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
//     params: ['text to search for'],
// };

// const andQueryExample: CoscradAndCondition = {
//     type: CoscradConditionBlockType.AND,
//     conditions: [pageLengthGreaterThan10, mlTextIncludes],
// };

// const orQueryExample: CoscradOrCondition = {
//     type: CoscradConditionBlockType.OR,
//     conditions: [pageLengthGreaterThan10, mlTextIncludes],
// };
