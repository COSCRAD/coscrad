import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ITermViewForVocabularyListEntry,
    IVocabularyListEntry,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Divider } from '@mui/material';
import { useContext, useReducer } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { FlatMultilingualTextPresenter } from '../../../utils/generic-components/presenters/flat-multilingual-text-presenter';
import { groupMultilingualTextItems } from '../../../utils/generic-components/presenters/group-multilingual-text-items';
import { Carousel } from '../../higher-order-components/carousel';
import doValuesMatchFilters from './do-values-match-filters';
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
    entries,
    form,
    contributions,
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

    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const selectedEntries = filterEntriesForSelectedTerms(entries, filterWithoutNullAndUndefined);

    const TermPresenterForVocabularyListEntry = ({
        id,
        name,
        contributions,
        audioURL,
    }: ITermViewForVocabularyListEntry): JSX.Element => {
        return (
            <ResourceDetailFullViewPresenter
                name={name}
                id={id}
                type={ResourceType.term}
                contributions={contributions}
                NamePresenter={({ name }) => {
                    const { primaryMultilingualTextItem, translations } =
                        groupMultilingualTextItems(name, defaultLanguageCode);

                    return (
                        <FlatMultilingualTextPresenter
                            primaryMultilingualTextItem={primaryMultilingualTextItem}
                            translations={translations}
                            variant={'body1'}
                        />
                    );
                }}
            >
                <Box
                    data-testid={buildDataAttributeForAggregateDetailComponent(
                        AggregateType.term,
                        id
                    )}
                />
                <Box id="media-player">
                    <AudioClipPlayer audioUrl={audioURL} />
                </Box>
            </ResourceDetailFullViewPresenter>
        );
    };

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.vocabularyList}
            contributions={contributions}
        >
            <Divider sx={{ marginTop: 2, marginBottom: 2, backgroundColor: 'primary.main' }} />
            <Carousel
                propsForItems={selectedEntries.map(({ term }) => term)}
                /**
                 * Note that we do not want to reuse the term detail full-view \ thumbnail
                 * presenter here. This is because there is a conflicting visual hierarchy
                 * when nesting a resource heading within another. Instead, we define
                 * a custom presenter for a term contained in the vocabulary list
                 * as one of its entries.
                 *
                 * Also note that in principle the back-end could use a different
                 * view (`IVocabularyListViewModelEntry["term"]`) for this. Our
                 * design is more robust to that possibility.
                 */
                Presenter={TermPresenterForVocabularyListEntry}
            />
            <VocabularyListForm
                fields={form.fields}
                onFormChange={(key: string, value: VocabularyListFilterProperty) =>
                    dispatch(updateVocabularyListFilter(key, value))
                }
                formState={filterWithoutNullAndUndefined}
            />
        </ResourceDetailFullViewPresenter>
    );
};
