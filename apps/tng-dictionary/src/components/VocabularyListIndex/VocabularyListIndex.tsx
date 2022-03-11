import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './VocabularyListIndex.module.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { TextField, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import doValuesMatchFilters from '../../utilities/doValuesMatchFilters';
import stringIncludes from '../../utilities/matchers/stringIncludes';
import { HasIdAndName } from '../../types/HasNameAndId';
import Test from '../sandbox/Test/Test';
import MiniLoading from '../MiniLoading/mini-loading';

type ComponentState = {
  vocabularyLists: HasIdAndName[];
  searchContext: 'name'
}

const determineSelectedVocabularyLists = (vocabularyLists: HasIdAndName[], filters: Record<string, string>) =>
  // @ts-ignore
  vocabularyLists.filter(name => doValuesMatchFilters(name, filters, stringIncludes))

const getData = async (endpoint: string) => fetch(endpoint).then(response => response.json())

/* eslint-disable-next-line */
export interface VocabularyListIndexProps { }

export function VocabularyListIndex(props: VocabularyListIndexProps) {

  const [appState, setAppState] = useState<ComponentState>({
    //  loading: false,
    vocabularyLists: [],
    searchContext: 'name'
  });
  const [searchResults, setSearchResults] = useState({
    selectedLists: appState.vocabularyLists,
  });

  useEffect(() => {
    setAppState({ vocabularyLists: [], searchContext: 'name' });
    const apiUrl = `http://localhost:3131/api/entities?type=vocabularyList`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((vocabularyLists) => {
        setAppState({ ...appState, vocabularyLists: vocabularyLists });
        setSearchResults({ selectedLists: vocabularyLists })
      }).catch(rej => console.log(rej))
  }, [setAppState]);

  // if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

  const rows: GridRowsProp = (searchResults.selectedLists).map(vocabularyList => ({
    id: vocabularyList.id,
    name: vocabularyList.name
  }));

  const columns: GridColDef[] = [{
    field: 'id',
    headerName: 'ID',
    renderCell: (idParam: GridRenderCellParams<string>) => (

      <Link className='link' to={`/vocabularyLists/${idParam.value}`}>
        <p>{idParam.value}</p>
      </Link>
    ),
    width: 100
  }, {
    field: 'name',
    headerName: 'Vocabulary List',
    width: 150,
    flex: 1
  }];

  const search =
    <div className='searchVocabulary'>
      <TextField
        placeholder="Search Vocabulary Lists"
        className='searchBars'
        onChange={(event) => setSearchResults({ selectedLists: event.target.value ? determineSelectedVocabularyLists(appState.vocabularyLists, { [appState.searchContext]: event.target.value }) : appState.vocabularyLists })}
        InputProps={{
          sx: { borderRadius: '24px' },
          endAdornment:
            (
              <SearchIcon className='searchIcon' />
            )
        }} />
    </div>
    ;

  return (

    <ThemeProvider theme={theme}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}>
        <div className='console'>
          <section>
            <h1 className='header' >
              Vocabulary Lists <MenuBookTwoToneIcon className='headerIcon' />
            </h1>
            {search}
          </section>
          <Typography>
            <DataGrid
              className='grid'
              rows={rows}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              initialState={{
                pagination: {
                  pageSize: 10,
                }
              }}
              components={{
                NoRowsOverlay: () => (
                  <MiniLoading />
                ),
                Panel: () => (
                  <p>© 2022 Tŝilhqot’in National Government</p>
                )
              }}
            />
          </Typography>
        </div>
      </motion.div>
    </ThemeProvider >
  );
}

export default VocabularyListIndex;

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(168,4,4)', // main color
    },
  },
})

const search = {
  color: 'rgb(159,2,2)'
}