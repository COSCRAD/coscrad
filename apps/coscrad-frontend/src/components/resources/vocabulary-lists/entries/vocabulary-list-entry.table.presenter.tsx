import {
    DropboxOrCheckbox,
    IMultilingualText,
    ITermViewModel,
    IVocabularyListEntryTable,
} from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../../configurable-front-matter/configurable-content-provider';
import { HeadingLabel, IndexTable } from '../../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../../utils/render-multilingual-text-cell';

export interface VocabularyListEntryTableViewPresenterProps {
    table: IVocabularyListEntryTable;
}

export const VocabularyListEntryTableViewPresenter = ({
    table,
}: VocabularyListEntryTableViewPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

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

    const renderTableCellForSelectionFilterProperty = (value: string): JSX.Element => (
        <div>{value}</div>
    );

    const renderTableCellForCheckboxFilterProperty = (value: string): JSX.Element => (
        <div>{value}</div>
    );

    dynamicColumnHeadings.forEach(({ propertyKey, type: filterPropertyType }) => {
        cellRenderersDefinition[propertyKey] =
            filterPropertyType === DropboxOrCheckbox.dropbox
                ? (row) => {
                      return renderTableCellForSelectionFilterProperty(row[propertyKey]);
                  }
                : (row) => {
                      const valueForThisRow = row[propertyKey];

                      return renderTableCellForCheckboxFilterProperty(valueForThisRow);
                  };
    });

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
        ({ propertyKey, allowedValuesAndLabels: _, type: filterPropertyType }) => {
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
                // @ts-expect-error TODO fix types
                tableData={tableData}
                cellRenderersDefinition={cellRenderersDefinition}
                heading={''}
                filterableProperties={filterableProperties}
                matchers={matchers}
            />
        </Box>
    );

    return tableView;
};
