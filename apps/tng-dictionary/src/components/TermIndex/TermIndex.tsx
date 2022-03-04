
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp, GridValueGetterParams } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { CircularProgress, TextField, ToggleButton } from '@mui/material';
import { useEffect, useState } from 'react';
import doValuesMatchFilters from '../../utilities/doValuesMatchFilters';
import Loading from '../Loading/Loading';
import TermData, { Term } from '../Term/Term';
import { ThemeProvider, createTheme } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import { motion } from 'framer-motion';
import stringIncludes from '../../utilities/matchers/stringIncludes';

// Do not export this outside. TODO- generalize this functionality
type SearchContext = 'term' | 'termEnglish';

type ComponentState = {
  allTerms: TermData[];
  searchContext: SearchContext;
  searchText: string;
  selectedTerms: TermData[];
}

const mapSwitchStateToSearchContext = (isChecked: boolean): SearchContext => isChecked ? 'termEnglish' : 'term';

const mapSearchContextToSwitchState = (searchContext: SearchContext): boolean => searchContext === 'termEnglish';

// TODO These labels need to come from settings \ config
const searchContextToPlaceholder: Record<SearchContext,string> = {
  term: 'Search Tŝilhqot’in',
  termEnglish: 'Search English'
}

const determineSelectedTerms = (allTerms: TermData[], filters: Record<string, string>) =>
  // @ts-ignore  
allTerms.filter(term => doValuesMatchFilters(term, filters, stringIncludes))

export default function DataGridDemo(): JSX.Element {
  const [componentState, setComponentState] = useState<ComponentState>({
    allTerms: [],
    searchContext: 'term',
    searchText: '',
    selectedTerms: []
  })

  useEffect(() => {
    setComponentState({ allTerms: [], searchContext: 'term', searchText: '', selectedTerms: [] });
    const apiUrl = `http://localhost:3131/api/entities?type=term`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((allTerms) => {
        setComponentState({ ...componentState, allTerms: allTerms, selectedTerms: allTerms });
      }).catch(rej => console.log(rej))
  }, [setComponentState]);

  if (componentState.allTerms === []) return <Loading />

  const rows: GridRowsProp = (componentState.selectedTerms).map(term => ({
    id: term.id,
    english: term.termEnglish,
    term: term.term
  }));

  const columns: GridColDef[] = [{
    field: 'id',
    headerName: 'ID',
    renderCell: (idParam: GridRenderCellParams<string>) => <Link style={{ color: 'rgb(159,2,2)' }} to={`/terms/${idParam.value}`}><p>{idParam.value}</p></Link>,
    width: 50
  },
  {
    field: 'term',
    headerName: 'Term',
    minWidth: 290,
    flex: .2,
    resizable: true,
  },
  {
    field: 'english',
    headerName: 'English',
    width: 150,
    flex: 1,
    resizable: true,
  }]

  const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setComponentState({
      ...componentState,
      searchText: event.target.value,
      selectedTerms: event.target.value ? determineSelectedTerms(componentState.allTerms, { [componentState.searchContext]: event.target.value }) : componentState.allTerms
    })
  }
  
  const buildSearchElement = (placeholderText: string): JSX.Element => (<TextField value={componentState.searchText} placeholder={placeholderText} onChange={(event) => handleSearchTextChange(event)} InputProps={{
    sx: { borderRadius: '24px', bgcolor: 'white', width: '300px' },
    endAdornment: (
      <SearchIcon sx={search} />
    )
  }} />)

  // SWITCHCOMPONENT

  const handleSwitchStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchContext = mapSwitchStateToSearchContext(event.target.checked)

    setComponentState({
      ...componentState,
      searchContext: newSearchContext,
      selectedTerms: componentState.searchText ? determineSelectedTerms(componentState.allTerms, { [newSearchContext]: componentState.searchText }) : componentState.allTerms
    })
  }

  return (

    <ThemeProvider theme={theme}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}>
        <div className='termindex'>
          <h1 style={{ lineHeight: '0px' }}>Terms <MenuBookTwoToneIcon /></h1>
          <div style={{ padding: '0px' }}>  {buildSearchElement(searchContextToPlaceholder[componentState.searchContext])} </div>

          <FormControlLabel control={<Switch checked={mapSearchContextToSwitchState(componentState.searchContext)} onChange={e => { handleSwitchStateChange(e) }} inputProps={{ 'aria-label': 'controlled' }} />} label={"Tŝilhqot'in / English"} />

        </div>
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[10, 50, 100]}
          initialState={{
            pagination: {
              pageSize: 10,
            }
          }}
          sx={{ background: 'white', height: '65vh', display: 'flex', flexDirection: "column-reverse" }}
          components={{
            NoRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                <CircularProgress />
              </Stack>
            ),
            Panel: () => (
              <p style={{ textAlign: 'center' }}>© 2022 Tsilhqot'in National Government</p>
            )
          }}
        />
      </motion.div>
    </ThemeProvider >

  );
}

export const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(255,28,28)', // main color
    },
  },
});

const search = {
  color: 'rgb(159,2,2)'
}