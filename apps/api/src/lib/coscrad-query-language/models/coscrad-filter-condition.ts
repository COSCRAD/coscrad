export enum CoscradConditionBlockType {
    OR = 'OR',
    AND = 'AND',
    NOT = 'NOT',
    SIMPLE = 'SIMPLE',
}

export enum CoscradBooleanOperator {
    GREATER_THAN = 'GREATER_THAN',
    MULTILINGUAL_TEXT_INCLUDES = 'MULTILINGUAL_TEXT_INCLUDES',
    MULTILINGUAL_TEXT_INCLUDES_LETTER = 'MULTILINGUAL_TEXT_INCLUDES_LETTER',
    HAS_PROPERTY = 'HAS_PROPERTY',
    HAS_LENGTH_GREATER_THAN = 'HAS_LENGTH_GREATER_THAN',
    TEXT_INCLUDES = 'TEXT_INCLUDES',
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
    type = CoscradConditionBlockType.AND;

    conditions: CoscradSimpleCondition[];
}

export class CoscradNotCondition implements CoscradCoditionBlock {
    type = CoscradConditionBlockType.NOT;

    condition: CoscradSimpleCondition;
}

export type CoscradFilterCondition =
    | CoscradAndCondition
    | CoscradOrCondition
    | CoscradNotCondition
    | CoscradSimpleCondition;
