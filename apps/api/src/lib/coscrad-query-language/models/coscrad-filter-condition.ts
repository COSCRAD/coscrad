/**
 * TODO We should break `COSCRAD query language` into a separate library.
 */
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
    TEXT_EQUALS = 'TEXT_EQUALS',
    MULTILINGUAL_TEXT_HAS_LETTER = 'MULTILINGUAL_TEXT_HAS_LETTER',
    IS_FLAGGED = 'IS_FLAGGED',
}

interface CoscradCoditionBlock {
    type: CoscradConditionBlockType;
}

type CoscradUserQueryParams = string | number | CoscradUserQueryParams[];

export class CoscradSimpleCondition implements CoscradCoditionBlock {
    readonly type = CoscradConditionBlockType.SIMPLE;

    field: string;

    operator: CoscradBooleanOperator;

    params: CoscradUserQueryParams[];
}

export class CoscradOrCondition implements CoscradCoditionBlock {
    readonly type = CoscradConditionBlockType.OR;

    conditions: CoscradSimpleCondition[];
}

export class CoscradAndCondition implements CoscradCoditionBlock {
    readonly type = CoscradConditionBlockType.AND;

    conditions: CoscradFilterCondition[];
}

export class CoscradNotCondition implements CoscradCoditionBlock {
    readonly type = CoscradConditionBlockType.NOT;

    condition: CoscradSimpleCondition;
}

export type CoscradFilterCondition =
    | CoscradAndCondition
    | CoscradOrCondition
    | CoscradNotCondition
    | CoscradSimpleCondition;
