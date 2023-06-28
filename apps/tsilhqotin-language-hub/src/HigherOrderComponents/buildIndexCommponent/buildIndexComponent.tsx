import {
    IBaseViewModel,
    IDetailQueryResult,
    IIndexQueryResult,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type PropertyKeyAndHeading<TKeys> = {
    propertyKey: TKeys;

    heading: string;
};

type DetailPageLinkRenderer = (id: string) => string;

type IndexComponentState<T extends Record<string, unknown>> = {
    viewModelResults: IDetailQueryResult<IBaseViewModel>[];
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
        console.log({
            keysToKeep,
            key,
            value,
        });

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
            selectedViewModels: [],
        });

        useEffect(() => {
            // TODO generalize the search context piece
            setAppState({ viewModelResults: [], searchContext: 'title' });

            fetch(fetchManyEndpoint, { mode: 'cors' })
                .then((res) => res.json())
                .then((result: IIndexQueryResult<IBaseViewModel>) => {
                    console.log({ apiResult: result });

                    const adaptedEntities = result.entities.map(({ id, name }) => ({
                        id,
                        title: name.items.find(
                            ({ languageCode }) => languageCode === LanguageCode.Chilcotin
                        )?.text,
                        titleEnglish: name.items.find(
                            ({ languageCode }) => languageCode === LanguageCode.English
                        )?.text,
                        // We don't care about the following 2 but the compiler does
                        name,
                        actions: [],
                    }));

                    setAppState({ ...appState, viewModelResults: adaptedEntities });
                    setSearchResults({ selectedViewModels: adaptedEntities });
                })
                .catch((rej) => console.log(rej));
        }, []);

        // if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

        const rows: GridRowsProp = searchResults.selectedViewModels
            .map((result) => {
                return result;
            })

            .map((viewModel) =>
                buildStreamlinedViewmodelForTable(
                    viewModel,
                    propertyKeysAndHeadings.map(({ propertyKey }) => propertyKey)
                )
            );

        console.log({ rows });

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
