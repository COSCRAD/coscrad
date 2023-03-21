import { IBaseViewModel } from '@coscrad/api-interfaces';
import { useContext, useEffect, useState } from 'react';
import { ConfigurableContentContext } from '../../../../../configurable-front-matter/configurable-content-provider';
import { EmptyIndexViewException, UnnecessaryCellRendererDefinitionException } from './exceptions';
import { filterTableData, Matchers } from './filter-table-data';
import './generic-index-table-presenter.css';
import { IndexTablePresenter } from './index-table-presenter';
import './index-table.css';
import { IndexViewHeader } from './index-view-header';
import { CellRenderer, CellRenderersMap, HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

export const DEFAULT_PAGE_SIZE = 5;

const pageSizeOptions: number[] = [DEFAULT_PAGE_SIZE, 10, 50, 100];

const labelForSearchAllPropertiesOption = 'ALL';

const calculateNumberOfPages = (numberOfRecords: number, pageSize: number) => {
    const quotient = Math.floor(numberOfRecords / pageSize);

    const remainder = numberOfRecords % pageSize;

    return remainder === 0 ? quotient : quotient + 1;
};

/**
 * TODO [https://www.pivotaltracker.com/story/show/182694263]
 * Add ValueUnion to the types library.
 */
export type ValueUnion<T> = T[keyof T];

/**
 * We want to constrain the keys of renderers to a subset of the heading
 * labels' property keys. - This could lead to clients specifying unused renderers.
 * For now, we just do a check and throw.
 *
 * We may also want to require renderers for non-string (or maybe non-primitive types)
 */
export interface IndexViewContainerProps<T extends IBaseViewModel> {
    headingLabels: HeadingLabel<T>[];
    indexViewData: T[];
    cellRenderersDefinition: CellRenderersDefinition<T>;
    heading: string;
    filterableProperties: (keyof T)[];
    matchers?: Matchers<T>;
}

const allProperties = 'allProperties';

export const IndexViewContainer = <T extends IBaseViewModel>({
    headingLabels,
    indexViewData: tableData,
    cellRenderersDefinition,
    heading,
    filterableProperties,
    matchers = {}, // default to String(value) & case-insensitive search
}: IndexViewContainerProps<T>) => {
    if (headingLabels.length === 0) {
        throw new EmptyIndexViewException();
    }

    // TODO [] Encapsulte this as part of the `SearchBar`.
    const { simulatedKeyboard } = useContext(ConfigurableContentContext);

    const [searchValue, setSearchValue] = useState('');

    // SEARCH LOGIC
    const [selectedFilterProperty, setSelectedFilterProperty] = useState<
        typeof allProperties | keyof T
    >(allProperties);

    const [shouldUseVirtualKeyboard, _setShouldUseVirtualKeyboard] = useState<boolean>(true);

    const propertiesToFilterBy =
        selectedFilterProperty === 'allProperties'
            ? filterableProperties
            : [selectedFilterProperty];

    const filteredTableData = filterTableData(
        tableData,
        propertiesToFilterBy,
        searchValue,
        matchers
    );

    // PAGINATION
    // we index pages starting at 0
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

    const lastPageIndex = calculateNumberOfPages(filteredTableData.length, pageSize) - 1;

    useEffect(() => {
        if (currentPageIndex > lastPageIndex) setCurrentPageIndex(0);
    }, [lastPageIndex, currentPageIndex]);

    const startIndex = currentPageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredTableData.slice(startIndex, endIndex);

    /**
     * It's tricky to get type safety that forces cell renderers to only include
     * properties referenced in the heading labels. For now, we'll do a dynamic
     * check instead.
     */
    const propertiesInTable = headingLabels.map(({ propertyKey }) => propertyKey);

    const cellRendererKeysNotInHeadings = Object.keys(cellRenderersDefinition).reduce(
        (acc: string[], rendererPropertyKey) =>
            // @ts-expect-error We need to tell the compiler the keys of IBaseViewModel  must be strings
            propertiesInTable.includes(rendererPropertyKey) ? acc : acc.concat(rendererPropertyKey),
        []
    );

    if (cellRendererKeysNotInHeadings.length > 0) {
        throw new UnnecessaryCellRendererDefinitionException(cellRendererKeysNotInHeadings);
    }

    const cellRenderers: CellRenderersMap<T> = new Map(
        Object.entries(cellRenderersDefinition) as [keyof T, CellRenderer<T>][]
    );

    /**
     * TODO Break the presentation part of this table out so that we can inject
     * instead a mobile list view, for example, without rewriting the filtering
     * and pagination logic.
     */

    const isMobile = false;

    return (
        <>
            <IndexViewHeader
                heading={heading}
                selectedFilterProperty={selectedFilterProperty}
                setSelectedFilterProperty={setSelectedFilterProperty}
                labelForSearchAllPropertiesOption={labelForSearchAllPropertiesOption}
                filterableProperties={filterableProperties}
                headingLabels={headingLabels}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                shouldUseVirtualKeyboard={shouldUseVirtualKeyboard}
                simulatedKeyboard={simulatedKeyboard}
                _setShouldUseVirtualKeyboard={_setShouldUseVirtualKeyboard}
            />

            {isMobile ? (
                <div>Mobile Component</div>
            ) : (
                <IndexTablePresenter
                    headingLabels={headingLabels}
                    paginatedData={paginatedData}
                    cellRenderers={cellRenderers}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    pageSizeOptions={pageSizeOptions}
                    currentPageIndex={currentPageIndex}
                    setCurrentPageIndex={setCurrentPageIndex}
                    lastPageIndex={lastPageIndex}
                />
            )}
        </>
    );
};
