import {
    ICategorizableDetailQueryResult,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import {
    isVocabularyListEntryViewType,
    VocabularyListEntryPresenter,
    VocabularyListEntryViewType,
} from './vocabulary-list-entry.presenter';

export const VocabularyListDetailFullViewPresenter = ({
    id,
    name,
    entries,
    form,
    contributions,
    table,
}: ICategorizableDetailQueryResult<IVocabularyListViewModel>): JSX.Element => {
    const [entryViewType, setEntryViewType] = React.useState(VocabularyListEntryViewType.Carousel);

    const handleChange = (_event: React.MouseEvent<HTMLElement>, entryViewType: unknown) => {
        /**
         * In the e2e test, we encountered a first event that had null data on first
         * render. We ignore this.
         */
        if (entryViewType === null) {
            return;
        }

        if (!isVocabularyListEntryViewType(entryViewType)) {
            throw new Error(
                `Failed to set the vocabulary list entry view type to invalid value: ${entryViewType}`
            );
        }

        setEntryViewType(entryViewType);
    };

    // const { dynamicColumnHeadings, data: tableData } = table;

    // const tableHeadings: HeadingLabel<ITermViewModel & Record<string, unknown>>[] = [
    //     { propertyKey: 'id', headingLabel: 'Link' },
    //     { propertyKey: 'name', headingLabel: 'Term' },
    //     { propertyKey: 'contributions', headingLabel: 'Contributions' },
    //     { propertyKey: 'audioURL', headingLabel: 'Audio' },
    //     { propertyKey: 'tokens', headingLabel: 'Letters' },
    // ];

    // dynamicColumnHeadings.forEach((h) => tableHeadings.push(h));

    // const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
    //     id: renderAggregateIdCell,
    //     name: ({ name }: ITermViewModel) => renderMultilingualTextCell(name, defaultLanguageCode),
    // };

    // const renderTableCellForSelectionFilterProperty = (
    //     value: string,
    //     labels: Record<string, string>
    // ): JSX.Element => <div>{labels[value] || '-'}</div>;

    // const renderTableCellForCheckboxFilterProperty = (
    //     value: string,
    //     labelsForTrueAndFalse: {
    //         true: string;
    //         false: string;
    //     }
    // ): JSX.Element => <div>{labelsForTrueAndFalse[value]}</div>;

    // dynamicColumnHeadings.forEach(
    //     ({ propertyKey, type: filterPropertyType, allowedValuesAndLabels }) => {
    //         cellRenderersDefinition[propertyKey] =
    //             filterPropertyType === DropboxOrCheckbox.dropbox
    //                 ? (row) => {
    //                       // TODO do this on the backend?
    //                       const lookupTableForLabels = allowedValuesAndLabels.reduce(
    //                           (acc, { value, label }) => {
    //                               acc[isNonEmptyString(value) ? value : JSON.stringify(value)] =
    //                                   label;

    //                               return acc;
    //                           },
    //                           {}
    //                       );

    //                       return renderTableCellForSelectionFilterProperty(
    //                           row[propertyKey],
    //                           lookupTableForLabels
    //                       );
    //                   }
    //                 : (row) => {
    //                       const valueForThisRow = row[propertyKey];

    //                       const labelForTrueAndFalse = {
    //                           true:
    //                               allowedValuesAndLabels.find(
    //                                   ({ value }) => isBoolean(value) && value
    //                               )?.label || 'True',
    //                           false:
    //                               allowedValuesAndLabels.find(
    //                                   ({ value }) => isBoolean(value) && !value
    //                               )?.label || 'False',
    //                       };

    //                       return renderTableCellForCheckboxFilterProperty(
    //                           valueForThisRow,
    //                           labelForTrueAndFalse
    //                       );
    //                   };
    //     }
    // );

    // const filterableProperties = ['name', 'tokens'];

    // dynamicColumnHeadings.forEach(({ propertyKey }) => {
    //     filterableProperties.push(propertyKey);
    // });

    // // @ts-expect-error fix me
    // const matchers: Matchers<IVocabularyListEntryTableRow> = {
    //     // TODO Is there a helper for this?
    //     name: ({ items }: IMultilingualText, search) =>
    //         items.some(({ text }) => text.toLowerCase().includes(search.toLowerCase())),
    //     // TODO export to a util and share with term index view
    //     tokens: (tokens, searchTerm) =>
    //         // TODO why is there no type safety here?
    //         (tokens || []).some(({ characters }) =>
    //             characters.some((c) => {
    //                 const doesMatch = c.text === searchTerm.toLowerCase();

    //                 if (c.isOutOfAlphabet) return false;

    //                 return doesMatch;
    //             })
    //         ),
    // };

    // dynamicColumnHeadings.forEach(
    //     ({ propertyKey, allowedValuesAndLabels, type: filterPropertyType }) => {
    //         // TODO consider matching by value as well

    //         // TODO Unit test these
    //         if (filterPropertyType === DropboxOrCheckbox.dropbox) {
    //             matchers[propertyKey] = (row, search: string) => {
    //                 return search === 'hi';
    //             };
    //         }

    //         matchers[propertyKey] = (_) => true;
    //     }
    // );

    // const tableView = (
    //     <Box data-testid="tableview">
    //         <IndexTable
    //             type={'vocabularyListEntryTableRow'}
    //             headingLabels={tableHeadings}
    //             // @ts-expect-error dynamic keys are difficult to type
    //             tableData={tableData}
    //             cellRenderersDefinition={cellRenderersDefinition}
    //             heading={''}
    //             filterableProperties={filterableProperties}
    //             matchers={matchers}
    //         />
    //     </Box>
    // );

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
                    {Object.entries(VocabularyListEntryViewType).map(([label, viewType]) => (
                        <ToggleButton sx={{ borderRadius: 10 }} value={label}>
                            {label} (value: {viewType})
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            <div>view type: {entryViewType}</div>
            <VocabularyListEntryPresenter
                viewType={entryViewType}
                entries={entries}
                form={form}
                table={table}
            />
        </ResourceDetailFullViewPresenter>
    );
};
