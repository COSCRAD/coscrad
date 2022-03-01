
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp, GridValueGetterParams } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { CircularProgress, TextField, ToggleButton } from '@mui/material';
import { useEffect, useState } from 'react';
import doValuesMatchFilters from '../../utilities/doValuesMatchFilters';
import Loading from '../Loading/Loading';
import TermData, { Term } from '../Term/Term';
import { ThemeProvider, createTheme } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { initial } from 'cypress/types/lodash';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import Pagination from '@mui/material/Pagination';
import TablePagination from '@mui/material/TablePagination'


type ComponentState = {
  allTerms: TermData[];
  searchContext: 'term';
}



const stringIncludes = (input: string, textToMatch: string) => input.includes(textToMatch)

const determineSelectedTerms = (allTerms: TermData[], filters: Record<string, string>) =>
  // @ts-ignore
  allTerms.filter(TermData => doValuesMatchFilters(TermData, filters, stringIncludes))

export default function DataGridDemo(): JSX.Element {
  const [componentState, setComponentState] = useState<ComponentState>({
    allTerms: [],
    searchContext: 'term'
  })

  const [searchResults, setSearchResults] = useState({
    selectedTerms: componentState.allTerms,
  });

  useEffect(() => {
    setComponentState({ allTerms: [], searchContext: 'term' });
    const apiUrl = `http://localhost:3131/api/entities?type=term`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((allTerms) => {
        setComponentState({ ...componentState, allTerms: allTerms });
        setSearchResults({ selectedTerms: allTerms })
      }).catch(rej => console.log(rej))
  }, [setComponentState]);

  if (componentState.allTerms === []) return <Loading />

  const rows: GridRowsProp = (searchResults.selectedTerms).map(term => ({
    id: term.id,
    english: term.termEnglish,
    term: term.term
  }));

  const columns: GridColDef[] = [{
    field: 'id',
    headerName: 'ID',
    renderCell: (idParam: GridRenderCellParams<string>) => <Link to={`/terms/${idParam.value}`}><p>{idParam.value}</p></Link>,
    width: 50
  },
  {
    field: 'term',
    headerName: 'Term',
    minWidth: 200,
    flex: 0,
    resizable: true,
  },
  {
    field: 'english',
    headerName: 'English',
    width: 150,
    flex: 1
  }]

  const searchTsilhqotin = <TextField placeholder="Search Tŝilhqot'in" onChange={(event) => setSearchResults({ selectedTerms: event.target.value ? determineSelectedTerms(componentState.allTerms, { [componentState.searchContext]: event.target.value }) : componentState.allTerms })} InputProps={{
    sx: { borderRadius: '24px', bgcolor: 'white', width: '300px' },
    endAdornment: (
      <SearchIcon sx={search} />
    )
  }} />;
  const searchEnglish = <TextField placeholder={'Search English'} onChange={(event) => setSearchResults({ selectedTerms: event.target.value ? determineSelectedTerms(componentState.allTerms, { [componentState.searchContext]: event.target.value }) : componentState.allTerms })}
    InputProps={{
      sx: { borderRadius: '24px', bgcolor: 'white', width: '300px', boxShadow: '' },
      endAdornment: (
        <SearchIcon sx={search} />
      ),
    }}

  />;

  // SWITCHCOMPONENT
  const [toggled, setToggled] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToggled(event.target.checked)

  };

  const [isToggled, setToggle] = useState(0);


  return (

    <ThemeProvider theme={theme}>
      <div className='termindex'>
        <h1 style={{ lineHeight: '0px' }}>Terms <MenuBookTwoToneIcon /></h1>
        <div style={{ padding: '0px' }}> {toggled ? [searchEnglish] : [searchTsilhqotin]} </div>

        <FormControlLabel control={<Switch onChange={handleChange} inputProps={{ 'aria-label': 'controlled' }} />} label={"Tŝilhqot'in / English"} />

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
        sx={{ bgcolor: 'white', height: '65vh', display: 'flex', flexDirection: "column-reverse" }}
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