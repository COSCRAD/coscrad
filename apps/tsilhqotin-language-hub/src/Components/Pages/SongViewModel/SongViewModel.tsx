import { Card } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConfig } from '../../../config';

export type SongData = {
    title: string;

    titleEnglish: string;

    id: string;
};

type SongResult = {
    data: SongData;
};

type ComponentState = {
    songs: SongResult[];
    searchContext: 'title';
};

const getData = async (endpoint: string) => fetch(endpoint).then((response) => response.json());

/* eslint-disable-next-line */
export interface SongViewModelProps {
    songData?: SongData;
}

export function SongViewModel(props: SongViewModelProps) {
    const [appState, setAppState] = useState<ComponentState>({
        songs: [],
        searchContext: 'title',
    });
    const [searchResults, setSearchResults] = useState({
        selectedSongs: appState.songs,
    });

    useEffect(() => {
        setAppState({ songs: [], searchContext: 'title' });
        const apiUrl = `${getConfig().apiBaseUrl}/api/resources/songs`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((songs) => {
                setAppState({ ...appState, songs: songs });
                setSearchResults({ selectedSongs: songs.data });
            })
            .catch((rej) => console.log(rej));
    }, [setAppState]);

    const rows: GridRowsProp = searchResults.selectedSongs
        .map((result) => result.data)
        .map((song) => ({
            title: song.title,
            titleEnglish: song.titleEnglish,
            id: song.id,
        }));

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            renderCell: (idParam: GridRenderCellParams<string>) => (
                <Link className="link" to={`/songs/${idParam.value}`}>
                    <p>{idParam.value}</p>
                </Link>
            ),
        },
        {
            field: 'title',
            headerName: 'TITLE',
            width: 100,
        },
        {
            field: 'titleEnglish',
            headerName: 'ENGLISH',
            width: 150,
            flex: 1,
        },
    ];

    return (
        <ThemeProvider theme={theme}>
            <div className="page">
                <div id="heading">
                    <div id="container">
                        <h1 id="pageTitle">Songs</h1>
                    </div>
                </div>
                <Card className="pageContent">
                    <DataGrid
                        sx={{ minHeight: '60vh', padding: '10px' }}
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
        </ThemeProvider>
    );
}

export default SongViewModel;

const theme = createTheme({
    palette: {
        primary: {
            main: 'rgb(168,4,4)',
        },
    },
});
