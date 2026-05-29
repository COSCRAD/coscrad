import { ITermViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../errors/InternalError';
import { compileMultilingualTextContainsQuery } from './compile-multilingual-text-contains-query';
import { ALL_PROPERTIES_SEARCH_KEY, IndexSearchScope } from './constants';

// TODO aren't these available elsewhere?
interface ISimpleCondition {
    type: string;

    /**
     * Type safety is difficult here. It's not just `keyof T` that are supported
     * but also things like `contributions[*].statement`.
     */
    field: string;

    operator: string;

    params: unknown[];
}

interface IComplexUserDefinedFilter {
    type: string;
    conditions: ISimpleCondition[];
}

export type IUserDefinedFilter = IComplexUserDefinedFilter | ISimpleCondition;

export const interpretCoscradQueryFromUserSearchText = ({
    scope,
    query,
    defaultLanguageCode = LanguageCode.English,
}: {
    // TODO this should work for all resource types
    scope: IndexSearchScope<ITermViewModel>;
    query: string;
    defaultLanguageCode?: LanguageCode;
}): IUserDefinedFilter | InternalError => {
    if (scope === ALL_PROPERTIES_SEARCH_KEY) {
        return {
            type: 'OR',
            // @ts-expect-error TODO let's sort out the full types in api-interfaces
            conditions: (['name', 'contributions', 'vocabularyLists', 'tokens'] as const).map(
                (field) =>
                    interpretCoscradQueryFromUserSearchText({
                        scope: field,
                        query: query,
                        defaultLanguageCode,
                    })
            ),
        };
    }

    if (scope === 'name') {
        if (query.charAt(0) === '{' && query.includes('}')) {
            return compileMultilingualTextContainsQuery(scope, query);
        }
    }

    if (scope === 'contributions') {
        const simpleFilter = {
            type: 'SIMPLE',
            field: `contributions[*].statement`,
            operator: 'TEXT_INCLUDES',
            params: [query],
        };

        return simpleFilter;
    }

    if (scope === 'vocabularyLists') {
        return {
            type: 'SIMPLE',
            field: `vocabularyLists[*].name`,
            operator: 'MULTILINGUAL_TEXT_INCLUDES',
            // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-340] Include language code option
            params: [query],
        };
    }

    if (scope === 'tokens') {
        return {
            type: 'SIMPLE',
            field: `tokens`,
            // TODO support this
            operator: 'MULTILINGUAL_TEXT_INCLUDES_LETTER',
            /**
             * Allow the user to specify the language code once we tokenize English as well.
             * Right now, we assume that users will only search the Indigenous language
             * that is default for the tenant.
             */
            params: [query, defaultLanguageCode],
        };
    }

    const simpleFilter = {
        type: 'SIMPLE',
        field: scope,
        operator: 'MULTILINGUAL_TEXT_INCLUDES',
        params: [query],
    };

    return simpleFilter;
};
