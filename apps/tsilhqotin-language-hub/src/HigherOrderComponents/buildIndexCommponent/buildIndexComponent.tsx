import { Card, createTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type PropertyKeyAndHeading<TKeys> = {
    propertyKey: TKeys;

    heading: string;
};

type DetailPageLinkRenderer = (id: string) => string;

type DetailAction = unknown;

type IndexAction = unknown;

type IndexQueryData<T> = {
    data: T[];
    actions: DetailAction[];
};

// TODO share this with the backend
type IndexQueryResult<T> = {
    data: IndexQueryData<T>;
    actions: IndexAction[];
};

type IndexComponentState<T extends Record<string, unknown>> = {
    viewModelResults: IndexQueryData<T>[];
    searchContext: keyof T;
};

const buildStreamlinedViewmodelForTable = <T extends Record<string, unknown>, U extends keyof T>(
    viewModel: T,
    keysToKeep: U[]
): Omit<T, U> =>
    Object.entries(viewModel).reduce((acc: Omit<T, U>, [key, value]: [keyof T, unknown]) => {
        if (!keysToKeep.includes(key as any)) return acc;

        // @ts-expect-error fix this later
        acc[key] = value;

        return acc;
    }, {} as Omit<T, U>);

const buildIndexComponent = <T extends Record<string, unknown>>(
    propertyKeysAndHeadings: PropertyKeyAndHeading<keyof T>[],
    renderDetailLink: DetailPageLinkRenderer,
    fetchManyEndpoint: string
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
                    setSearchResults({ selectedViewModels: result.data });
                })
                .catch((rej) => console.log(rej));
        }, [setAppState]);

        // if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

        const rows: GridRowsProp = searchResults.selectedViewModels
            .map((result) => result.data)

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
                <Link className="link" to={renderDetailLink(param.row.id)}>
                    <p>{param.value}</p>
                </Link>
            ),
        }));

        return (
            <div className="page">
                <div id="heading">
                    <div id="container">
                        <h1 id="pageTitle">Songs</h1>
                    </div>
                </div>
                <Card className="pageContent">
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
                </Card>
            </div>
        );
    };
};

const theme = createTheme({
    palette: {
        primary: {
            main: 'rgb(168,4,4)',
        },
    },
});

export default buildIndexComponent;
