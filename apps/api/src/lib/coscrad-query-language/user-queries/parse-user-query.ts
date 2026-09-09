import { NotImplementedException } from '@nestjs/common';
import { CoscradFilterCondition } from '../models/coscrad-filter-condition';

export type UserSearch<TView> = {
    scope: keyof TView | '__ALL__';
    // TODO should we have an explicit "operator" here ?
    searchTerms: string;
};

/**
 * A user query consists of a
 * - resource type
 * - search scope: an (aliased to be user-facing) key of the corresponding view or a special **all** key
 * - search terms: a query expression whose interpretation depends on the data type of the target field (key from search scope)
 *
 * Currently the operator is part of the search term. so `vocabulary lists` `> 10` would be interpreted as a search for all
 * terms appearing in more than 10 vocabulary lits. The `>` operator is only available if the field corresponding to the search scope
 * is compatible with the given operator. Otherwise, it is treated as ordinary test.
 *
 * The problem with this is that the user may want to search for `>` as plain text.
 *
 * Note that we **could** populate the search bar options from the schema via `resource infos`. This would look like:
 * ```ts
 * const resourceInfos = {
 * // ... other resources
 * term: {
 *      searchableProperties: [{
 *         label: 'term',
 *         key: 'name',
 *         operators: [{
 *             "label": "multilingual text includes",
 *             "description": "does this text appear in any language?",
 *              "parameters": [{ label: "language", options: [....]}]
 *      }] // ..
 * }]
 * }
 * }
 * ```
 */

export const parseUserQuery = <T>(_userSearch: UserSearch<T>): CoscradFilterCondition => {
    /**
     * TODO Validate the operators against the schema \ resource configuration to ensure
     * that those operators are available for those fields.
     *
     * Do we need to alias the field keys for user-facing labels?
     */
    throw new NotImplementedException();
};
