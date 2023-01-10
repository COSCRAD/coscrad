import {
    ICategorizableDetailQueryResult,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { useReducer } from 'react';
import { Carousel } from '../../higher-order-components/carousel';
import { TermDetailFullViewPresenter } from '../terms/term-detail.full-view.presenter';
import doValuesMatchFilters from './do-values-match-filters';
import { formatBilingualText } from './utils';
import { VocabularyListForm } from './vocabulary-list-form';

type VocabularyListFilterProperty = string | boolean;

export type VocabularyListFilter = Record<string, VocabularyListFilterProperty>;

const UPDATE_VOCABULARY_LIST_FILTER = 'UPDATE_VOCABULARY_LIST_FILTER';

type UpdateVocabularyListFilterPayload = {
    key: string;
    value: string | boolean;
};

type FSA<T, U> = {
    type: T;
    payload: U;
};

const updateVocabularyListFilter = (
    key: string,
    value: VocabularyListFilterProperty
): FSA<typeof UPDATE_VOCABULARY_LIST_FILTER, UpdateVocabularyListFilterPayload> => ({
    type: UPDATE_VOCABULARY_LIST_FILTER,
    payload: {
        key,
        value,
    },
});

const filterReducer = (
    state: VocabularyListFilter,
    {
        type,
        payload: { key, value },
    }: FSA<typeof UPDATE_VOCABULARY_LIST_FILTER, UpdateVocabularyListFilterPayload>
) => {
    if (type !== UPDATE_VOCABULARY_LIST_FILTER) return state;

    return {
        /**
         * Note that we **are** immutably updating state since each property
         * is a primitive (`string` | `boolean`) and hence a shallow clone
         * is as good as deep.
         */
        ...state,
        [key]: value,
    };
};

const filterEntriesForSelectedTerms = (
    allEntries: IVocabularyListEntry<VocabularyListFilterProperty>[],
    filter: VocabularyListFilter
): IVocabularyListEntry<VocabularyListFilterProperty>[] =>
    allEntries.filter(({ variableValues }) => {
        return doValuesMatchFilters(variableValues, filter);
    });

export const VocabularyListDetailFullViewPresenter = ({
    id,
    name,
    nameEnglish,
    entries,
    form,
}: ICategorizableDetailQueryResult<IVocabularyListViewModel>): JSX.Element => {
    const [filter, dispatch] = useReducer(filterReducer, {});

    const filterWithoutNullAndUndefined = Object.entries(filter).reduce(
        (acc, [key, value]) =>
            isNullOrUndefined(value)
                ? acc
                : {
                      ...acc,
                      [key]: value,
                  },
        {}
    );

    const selectedEntries = filterEntriesForSelectedTerms(entries, filterWithoutNullAndUndefined);

    return (
        <div data-testid={id}>
            <h1>{formatBilingualText(name, nameEnglish)}</h1>
            <div>
                <VocabularyListForm
                    fields={form.fields}
                    onFormChange={(key: string, value: VocabularyListFilterProperty) =>
                        dispatch(updateVocabularyListFilter(key, value))
                    }
                    formState={filterWithoutNullAndUndefined}
                />
            </div>
            <div>
                {/* We may want to give the user the option of seeing a Multiple Categorizables of Single Type view instead*/}
                <Carousel
                    propsForItems={selectedEntries.map(({ term }) => term)}
                    Presenter={TermDetailFullViewPresenter}
                />
            </div>
        </div>
    );
};
