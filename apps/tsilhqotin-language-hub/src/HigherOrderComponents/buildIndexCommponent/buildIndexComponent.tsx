import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Entity = {
    id: string;
    languageCode: string;
    role: string;
    text: string;
    audioURL: string;
};

type PropertyKeyAndHeading<TKeys> = {
    propertyKey: TKeys;

    heading: string;
};

type DetailPageLinkRenderer = (id: string) => string;

type DetailAction = unknown;

type IndexAction = unknown;

type IndexQueryData<T> = {
    // data: T[];
    entities: Entity[];
    actions: DetailAction[];
};

// TODO share this with the backend
type IndexQueryResult<T> = {
    entities: IndexQueryData<T>;
    actions: IndexAction[];
};

type IndexComponentState<T extends Record<string, unknown>> = {
    viewModelResults: IndexQueryData<T>[];
    searchContext: keyof T;
};

type HasId = {
    id: string;
};

const buildStreamlinedViewmodelForTable = <
    T extends Record<string, unknown> & HasId,
    U extends keyof T
>(
    viewModel: T,
    keysToKeep: U[]
): Omit<T, U> =>
    Object.entries(viewModel).reduce((acc: Omit<T, U>, [key, value]: [keyof T, unknown]) => {
        if (!keysToKeep.concat('id' as U).includes(key as U)) return acc;

        // @ts-expect-error fix this later
        acc[key] = value;

        return acc;
    }, {} as Omit<T, U>);

const buildIndexComponent = <T extends Record<string, unknown>>(
    propertyKeysAndHeadings: PropertyKeyAndHeading<keyof T>[],
    renderDetailLink: DetailPageLinkRenderer,
    fetchManyEndpoint: string,
    pageTitle: string
) => {
    return () => {
        const [appState, setAppState] = useState<IndexComponentState<T>>({
            //  loading: false,
            viewModelResults: [],
            searchContext: 'title',
        });

        const [searchResults, setSearchResults] = useState({
            selectedViewModels: appState.viewModelResults,
        });

        useEffect(() => {
            // TODO generalize the search context piece
            setAppState({ viewModelResults: [], searchContext: 'title' });

            fetch(fetchManyEndpoint, { mode: 'cors' })
                .then((res) => res.json())
                .then((result) => {
                    setAppState({ ...appState, viewModelResults: result });
                    setSearchResults({ selectedViewModels: result.entities });
                })
                .catch((rej) => console.log(rej));
        }, [appState, setAppState]);

        // if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

        const rows: GridRowsProp = searchResults.selectedViewModels
            //TODO make this result.entities
            .map((result) => result.entities)

            .map((viewModel) =>
                buildStreamlinedViewmodelForTable(
                    // @ts-expect-error fix this later
                    viewModel,
                    propertyKeysAndHeadings.map(({ propertyKey }) => propertyKey)
                )
            );

        const columns: GridColDef[] = propertyKeysAndHeadings.map(({ propertyKey, heading }) => ({
            // we know that we don't use symbol or number for view model property keys
            field: propertyKey as string,
            headerName: heading,
            renderCell: (param: GridRenderCellParams<string>) => (
                <Link className="links" to={renderDetailLink(param.row.id)}>
                    <p>{param.value}</p>
                </Link>
            ),
            flex: 1,
        }));

        return (
            <div className="page">
                <div id="heading">
                    <div id="container">
                        {/* #TODO set title dynamically for different indexes/indicies */}
                        <h1 id="pageTitle">{pageTitle}</h1>
                    </div>
                </div>
                <div id="indexPage">
                    <DataGrid
                        className="dataGrid"
                        rows={rows}
                        columns={columns}
                        rowsPerPageOptions={[10, 50, 100]}
                        initialState={{
                            pagination: {
                                pageSize: 10,
                            },
                        }}
                    />
                </div>
            </div>
        );
    };
};

export default buildIndexComponent;
