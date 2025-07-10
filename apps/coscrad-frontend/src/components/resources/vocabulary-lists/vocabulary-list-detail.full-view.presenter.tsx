import {
    AggregateType,
    DropboxOrCheckbox,
    ICategorizableDetailQueryResult,
    IMultilingualText,
    ITermViewForVocabularyListEntry,
    ITermViewModel,
    IVocabularyListEntry,
    IVocabularyListEntryTableRow,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isBoolean, isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useContext, useReducer } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { FlatMultilingualTextPresenter } from '../../../utils/generic-components/presenters/flat-multilingual-text-presenter';
import { groupMultilingualTextItems } from '../../../utils/generic-components/presenters/group-multilingual-text-items';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { Matchers } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { Carousel } from '../../higher-order-components/carousel';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';
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

enum EntryViewType {
    carousel = `Carousel`,
    table = `Table`,
}

export const VocabularyListDetailFullViewPresenter = ({
    id,
    name,
    entries,
    form,
    contributions,
    table,
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

    //TODO make default view configurable

    const [entryViewType, setEntryViewType] = React.useState(EntryViewType.carousel);

    const handleChange = (_event: React.MouseEvent<HTMLElement>, entryViewType: EntryViewType) => {
        setEntryViewType(entryViewType);
    };

    const carouselView = (
        <Box>
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
        </Box>
    );

    const { dynamicColumnHeadings, data: tableData } = table;

    const tableHeadings: HeadingLabel<ITermViewModel & Record<string, unknown>>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'name', headingLabel: 'Term' },
        { propertyKey: 'contributions', headingLabel: 'Contributions' },
        { propertyKey: 'audioURL', headingLabel: 'Audio' },
        { propertyKey: 'tokens', headingLabel: 'Letters' },
    ];

    dynamicColumnHeadings.forEach((h) => tableHeadings.push(h));

    const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name }: ITermViewModel) => renderMultilingualTextCell(name, defaultLanguageCode),
    };

    const renderTableCellForSelectionFilterProperty = (
        value: string,
        labels: Record<string, string>
    ): JSX.Element => <div>{labels[value] || '-'}</div>;

    const renderTableCellForCheckboxFilterProperty = (
        value: string,
        labelsForTrueAndFalse: {
            true: string;
            false: string;
        }
    ): JSX.Element => <div>{labelsForTrueAndFalse[value]}</div>;

    dynamicColumnHeadings.forEach(
        ({ propertyKey, type: filterPropertyType, allowedValuesAndLabels }) => {
            cellRenderersDefinition[propertyKey] =
                filterPropertyType === DropboxOrCheckbox.dropbox
                    ? (row) => {
                          // TODO do this on the backend?
                          const lookupTableForLabels = allowedValuesAndLabels.reduce(
                              (acc, { value, label }) => {
                                  acc[isNonEmptyString(value) ? value : JSON.stringify(value)] =
                                      label;

                                  return acc;
                              },
                              {}
                          );

                          return renderTableCellForSelectionFilterProperty(
                              row[propertyKey],
                              lookupTableForLabels
                          );
                      }
                    : (row) => {
                          const valueForThisRow = row[propertyKey];

                          const labelForTrueAndFalse = {
                              true:
                                  allowedValuesAndLabels.find(
                                      ({ value }) => isBoolean(value) && value
                                  )?.label || 'True',
                              false:
                                  allowedValuesAndLabels.find(
                                      ({ value }) => isBoolean(value) && !value
                                  )?.label || 'False',
                          };

                          return renderTableCellForCheckboxFilterProperty(
                              valueForThisRow,
                              labelForTrueAndFalse
                          );
                      };
        }
    );

    const filterableProperties = ['name', 'tokens'];

    dynamicColumnHeadings.forEach(({ propertyKey }) => {
        filterableProperties.push(propertyKey);
    });

    // @ts-expect-error fix me
    const matchers: Matchers<IVocabularyListEntryTableRow> = {
        // TODO Is there a helper for this?
        name: ({ items }: IMultilingualText, search) =>
            items.some(({ text }) => text.toLowerCase().includes(search.toLowerCase())),
        // TODO export to a util and share with term index view
        tokens: (tokens, searchTerm) =>
            // TODO why is there no type safety here?
            (tokens || []).some(({ characters }) =>
                characters.some((c) => {
                    const doesMatch = c.text === searchTerm.toLowerCase();

                    if (c.isOutOfAlphabet) return false;

                    return doesMatch;
                })
            ),
    };

    dynamicColumnHeadings.forEach(
        ({ propertyKey, allowedValuesAndLabels, type: filterPropertyType }) => {
            // TODO consider matching by value as well

            // TODO Unit test these
            if (filterPropertyType === DropboxOrCheckbox.dropbox) {
                matchers[propertyKey] = (row, search: string) => {
                    return search === 'hi';
                };
            }

            matchers[propertyKey] = (_) => true;
        }
    );

    const tableView = (
        <Box data-testid="tableview">
            <IndexTable
                type={'vocabularyListEntryTableRow'}
                headingLabels={tableHeadings}
                // @ts-expect-error dynamic keys are difficult to type
                tableData={tableData}
                cellRenderersDefinition={cellRenderersDefinition}
                heading={''}
                filterableProperties={filterableProperties}
                matchers={matchers}
            />
        </Box>
    );

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.vocabularyList}
            contributions={contributions}
        >
            <Box sx={{ textAlign: 'center', mb: 1 }}>
                <ToggleButtonGroup
                    color="primary"
                    value={entryViewType}
                    exclusive
                    onChange={handleChange}
                    aria-label="Vocabulary List"
                >
                    {Object.values(EntryViewType).map((viewType) => (
                        <ToggleButton sx={{ borderRadius: 10 }} value={viewType}>
                            {viewType}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {/* <Box>
                <Button
                    variant="contained"
                    onClick={() => setEntryViewType(EntryViewType.carousel)}
                >
                    Carousel
                </Button>
                <Button onClick={() => setEntryViewType(EntryViewType.table)}>Table</Button>
            </Box> */}

            {entryViewType === EntryViewType.carousel ? carouselView : tableView}
        </ResourceDetailFullViewPresenter>
    );
};
