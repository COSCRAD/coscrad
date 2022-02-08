import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading';
import './VocabularyListIndex.module.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';


type HasIdAndName = {
  id: string;
  name: string;
}

const getData = async (endpoint: string) => fetch(endpoint).then(response => response.json())

/* eslint-disable-next-line */
export interface VocabularyListIndexProps { }

export function VocabularyListIndex(props: VocabularyListIndexProps) {

  const [appState, setAppState] = useState({
    loading: false,
    vocabularyLists: null,
  });

  useEffect(() => {
    setAppState({ loading: true, vocabularyLists: null });
    const apiUrl = `http://104.225.142.106:3131/api/entities?type=vocabularyList`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((vocabularyLists) => {
        setAppState({ loading: false, vocabularyLists: vocabularyLists });
      }).catch(rej => console.log(rej))
  }, [setAppState]);

  if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

  const rows: GridRowsProp = (appState.vocabularyLists as unknown as HasIdAndName[]).map(vocabularyList => ({
    id: vocabularyList.id,
    name: vocabularyList.name
  }));

  const columns: GridColDef[] = [{
    field: 'id',
    headerName: 'ID',
    renderCell: (idParam: GridRenderCellParams<string>) => (
      <Link to={`/vocabularyLists/${idParam.value}`}><p style={{ color: 'red' }}>{idParam.value}</p></Link>
    ),
    width: 150
  }, {
    field: 'name',
    headerName: 'Vocabulary List',
    width: 150
  }]

  const stylez = {
    color: 'black'
  } as const

  return (
    <ThemeProvider theme={theme}>
      <Typography style={center} className='body'>
        <Typography style={style}>
          <DataGrid sx={height} rows={rows} columns={columns} pageSize={100} components={{ Toolbar: GridToolbar }} />
        </Typography>
      </Typography>
    </ThemeProvider>
  );
}


export default VocabularyListIndex;

const height = {
  height: '80vh',
  background: 'white',
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
  height: '90vh',
  width: 'fit-content',
  background: 'inherit',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  backgroundPosition: 'center',
  color: 'black',
  textAlign: 'center',
  display: 'inline-block'
} as const




