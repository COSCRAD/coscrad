import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import { FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HasIdAndName } from '../../types/HasNameAndId';
import doValuesMatchFilters from '../../utilities/doValuesMatchFilters';
import stringIncludes from '../../utilities/matchers/stringIncludes';
import MiniLoading from '../MiniLoading/mini-loading';
import './VocabularyListIndex.module.css';

type SearchContext = 'name' | 'nameEnglish';

type VocabularyListSummary = HasIdAndName;

type ComponentState = {
    vocabularyLists: VocabularyListSummary[];
    searchContext: SearchContext;
    searchText: string;
    selectedLists: VocabularyListSummary[];
};

const mapSwitchStateToSearchContext = (isChecked: boolean): SearchContext =>
    isChecked ? 'nameEnglish' : 'name';

const mapSearchContextToSwitchState = (searchContext: SearchContext): boolean =>
    searchContext === 'nameEnglish';

// TODO These labels need to come from settings \ config
const searchContextToPlaceholder: Record<SearchContext, string> = {
    name: 'Search Tŝilhqot’in',
    nameEnglish: 'Search English',
};

const determineSelectedVocabularyLists = (
    vocabularyLists: VocabularyListSummary[],
    filters: Record<string, string>
) =>
    // @ts-ignore
    vocabularyLists.filter((name) => doValuesMatchFilters(name, filters, stringIncludes));

const getData = async (endpoint: string) => fetch(endpoint).then((response) => response.json());

/* eslint-disable-next-line */
export interface VocabularyListIndexProps {}

export function VocabularyListIndex(props: VocabularyListIndexProps): JSX.Element {
    const [componentState, setComponentState] = useState<ComponentState>({
        //  loading: false,
        vocabularyLists: [],
        searchContext: 'name',
        searchText: '',
        selectedLists: [],
    });

    useEffect(() => {
        setComponentState({
            vocabularyLists: [],
            searchContext: 'name',
            searchText: '',
            selectedLists: [],
        });
        const apiUrl = `http://104.225.142.106:3131/api/entities/vocabularyLists`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((vocabularyLists) => {
                setComponentState({
                    ...componentState,
                    vocabularyLists: vocabularyLists,
                    selectedLists: vocabularyLists,
                });
            })
            .catch((rej) => console.log(rej));
    }, [setComponentState]);

    // if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

    const rows: GridRowsProp = componentState.selectedLists.map((vocabularyList) => ({
        id: vocabularyList.id,
        name: vocabularyList.name,
        nameEnglish: vocabularyList.nameEnglish,
    }));

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            renderCell: (idParam: GridRenderCellParams<string>) => (
                <Link className="link" to={`/vocabularyLists/${idParam.value}`}>
                    <p>{idParam.value}</p>
                </Link>
            ),
            width: 100,
            resizable: true,
        },
        {
            field: 'name',
            headerName: 'Vocabulary List',
            width: 160,
            flex: 0,
            resizable: true,
        },
        {
            field: 'nameEnglish',
            headerName: 'English',
            width: 150,
            flex: 1,
        },
    ];

    const handleSearchTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setComponentState({
            ...componentState,
            searchText: event.target.value,
            selectedLists: event.target.value
                ? determineSelectedVocabularyLists(componentState.vocabularyLists, {
                      [componentState.searchContext]: event.target.value,
                  })
                : componentState.vocabularyLists,
        });
    };

    const buildSearchElement = (placeholderText: string): JSX.Element => (
        <TextField
            value={componentState.searchText}
            placeholder={placeholderText}
            onChange={(event) => handleSearchTextChange(event)}
            InputProps={{
                className: 'searchProps',
                endAdornment: <SearchIcon className="searchIcon" />,
            }}
        />
    );

    // SWITCHCOMPONENT

    const handleSwitchStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchContext = mapSwitchStateToSearchContext(event.target.checked);

        setComponentState({
            ...componentState,
            searchContext: newSearchContext,
            vocabularyLists: componentState.searchText
                ? determineSelectedVocabularyLists(componentState.vocabularyLists, {
                      [newSearchContext]: componentState.searchText,
                  })
                : componentState.vocabularyLists,
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="console">
                    <section className="section">
                        <h1 className="header">
                            Vocabulary Lists <MenuBookTwoToneIcon className="headerIcon" />
                        </h1>

                        <div>
                            {buildSearchElement(
                                searchContextToPlaceholder[componentState.searchContext]
                            )}
                        </div>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={mapSearchContextToSwitchState(
                                        componentState.searchContext
                                    )}
                                    onChange={(e) => {
                                        handleSwitchStateChange(e);
                                    }}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            }
                            label={"Tŝilhqot'in / English"}
                        />
                    </section>
                    <Typography>
                        <DataGrid
                            className="grid"
                            sx={{ height: 'calc(100vh - 80px - 39px - 120px)' }}
                            rows={rows}
                            columns={columns}
                            rowsPerPageOptions={[10, 50, 100]}
                            initialState={{
                                pagination: {
                                    pageSize: 10,
                                },
                            }}
                            components={{
                                NoRowsOverlay: () => <MiniLoading />,
                                Panel: () => <p>© 2022 Tŝilhqot’in National Government</p>,
                            }}
                        />
                    </Typography>
                </div>
            </motion.div>
        </ThemeProvider>
    );
}

export default VocabularyListIndex;

const theme = createTheme({
    palette: {
        primary: {
            main: 'rgb(168,4,4)', // main color
        },
    },
});

const search = {
    color: 'rgb(159,2,2)',
};
