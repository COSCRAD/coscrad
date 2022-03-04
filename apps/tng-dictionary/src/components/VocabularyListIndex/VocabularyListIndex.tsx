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
import Stack from '@mui/material/Stack';
import stringIncludes from '../../utilities/matchers/stringIncludes';
import { HasIdAndName } from '../../types/HasNameAndId';



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
      <Link style={{ textDecoration: 'none' }} to={`/vocabularyLists/${idParam.value}`}><p style={{ color: 'rgb(159,2,2)' }}>{idParam.value}</p></Link>
    ),
    width: 150
  }, {
    field: 'name',
    headerName: 'Vocabulary List',
    width: 150,
    flex: 1
  }];

  const stylez = {
    color: 'black'
  } as const

  const search =
    <TextField placeholder="Search Vocabulary Lists"
      onChange={(event) => setSearchResults({ selectedLists: event.target.value ? determineSelectedVocabularyLists(appState.vocabularyLists, { [appState.searchContext]: event.target.value }) : appState.vocabularyLists })}
      InputProps={{
        sx: { borderRadius: '24px', bgcolor: 'white', width: '300px' },
        endAdornment: (
          <SearchIcon sx={{ color: 'rgb(159,2,2)' }} />
        )
      }} />;

  return (

    <ThemeProvider theme={theme}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}>
        <Typography style={center}>
          <div style={searchConsole}>
            <h1 style={header}>Vocabulary Lists <MenuBookTwoToneIcon /> </h1>
            {search}
          </div>
          <Typography style={style}>
            <DataGrid sx={height} rows={rows} columns={columns} rowsPerPageOptions={[10, 50, 100]}
              initialState={{
                pagination: {
                  pageSize: 10,
                }
              }}
              components={{
                NoRowsOverlay: () => (
                  <Stack height="100%" alignItems="center" justifyContent="center" >
                    <CircularProgress sx={{ color: 'rgb(255,28,28)' }} />
                  </Stack>
                ),
                Panel: () => (
                  <p style={{ textAlign: 'center' }}>© 2022 Tŝilhqot'in National Government</p>
                )
              }}
            />
          </Typography>
        </Typography>
      </motion.div>
    </ThemeProvider>
  );
}


export default VocabularyListIndex;

const height = {
  height: '65vh',
  width: '100vw',
  background: 'white',
  display: 'flex',
  flexDirection: "column-reverse"
}

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(168,4,4)', // main color
    },
  },
});

const center = {
  textAlign: 'center',
  justifySelf: 'center'
} as const

const style = {
  width: 'fit-content',

} as const

const searchConsole = {
  background: 'rgb(159,2,2)',
  paddingTop: '2px',
  paddingBottom: '37px'
} as const

const header = {
  lineHeight: '0px',
  color: 'white'
} as const