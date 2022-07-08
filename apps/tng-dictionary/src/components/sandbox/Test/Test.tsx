import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type SongData = {
    title: string;
    titleEnglish: string;
    id: string;
    audioURL: string;
    lyrics: string;
};

type SongResult = {
    data: SongData;
};

type ComponentState = {
    songs: SongResult[];
    searchContext: 'title';
};

//const getData = async (endpoint: string) => fetch(endpoint).then((response) => response.json());

/* eslint-disable-next-line */
export interface SongIndexProps {}

export function SongListIndex(props: SongIndexProps) {
    const [appState, setAppState] = useState<ComponentState>({
        //  loading: false,
        songs: [],
        searchContext: 'title',
    });
    const [searchResults, setSearchResults] = useState({
        selectedSongs: appState.songs,
    });

    useEffect(() => {
        setAppState({ songs: [], searchContext: 'title' });
        const apiUrl = `http://localhost:3131/api/resources/songs`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((songs) => {
                setAppState({ ...appState, songs: songs });
                setSearchResults({ selectedSongs: songs.data });
            })
            .catch((rej) => console.log(rej));
    }, [setAppState]);

    // if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading />

    const rows: GridRowsProp = searchResults.selectedSongs
        .map((result) => result.data)
        .map((song) => ({
            title: song.title,
            titleEnglish: song.titleEnglish,
            id: song.id,
            audioURL: song.audioURL,
            lyrics: song.lyrics,
            //  name: vocabularyList.name
        }));

    const columns: GridColDef[] = [
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
        {
            field: 'audioURL',
            headerName: 'audioURL',
            width: 150,
            flex: 1,
        },
        {
            field: 'lyrics',
            headerName: 'lyrics',
            width: 150,
            flex: 1,
        },
    ];

    const search = (
        <div className="searchVocabulary">
            <TextField
                placeholder="Search Vocabulary Lists"
                className="searchBars"
                InputProps={{
                    sx: { borderRadius: '24px' },
                    endAdornment: <SearchIcon className="searchIcon" />,
                }}
            />
        </div>
    );
    return (
        <ThemeProvider theme={theme}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="console">
                    <section>
                        <h1 className="header">
                            Vocabulary Lists <MenuBookTwoToneIcon className="headerIcon" />
                        </h1>
                        {search}
                    </section>
                    <Typography>
                        <DataGrid
                            className="grid"
                            rows={rows}
                            columns={columns}
                            rowsPerPageOptions={[10, 50, 100]}
                            initialState={{
                                pagination: {
                                    pageSize: 10,
                                },
                            }}
                            components={{
                                Panel: () => <p>© 2022 Tŝilhqot’in National Government</p>,
                            }}
                        />
                    </Typography>
                </div>
            </motion.div>
        </ThemeProvider>
    );
}

export default SongListIndex;

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
