import { Card } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { getConfig } from '../../../config';
import './MediaViewModel.module.css';

export type MediaData = {
    id: string;

    title: string;

    titleEnglish: string;
};

type MediaResult = {
    data: MediaData;
};

type ComponentState = {
    mediaItems: MediaResult[];
    searchContext: 'title';
};

/* eslint-disable-next-line */
export interface MediaViewModelProps {
    mediaData?: MediaData;
}

export function MediaViewModel(props: MediaViewModelProps) {
    const [appState, setAppState] = useState<ComponentState>({
        mediaItems: [],
        searchContext: 'title',
    });

    const [searchResults, setSearchResults] = useState({
        selectedMedia: appState.mediaItems,
    });

    useEffect(() => {
        setAppState({ mediaItems: [], searchContext: 'title' });
        const apiUrl = `${getConfig().apiBaseUrl}/api/resources/mediaItems`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((mediaItems) => {
                setAppState({ ...appState, mediaItems: mediaItems });
                setSearchResults({ selectedMedia: mediaItems.data });
            })
            .catch((rej) => console.log(rej));
    }, [setAppState]);

    const rows: GridRowsProp = searchResults.selectedMedia
        .map((result) => result.data)
        .map((media) => ({
            title: media.title,
            titleEnglish: media.titleEnglish,
            id: media.id,
        }));

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
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
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Videos</h1>
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
        </div>
    );
}

export default MediaViewModel;
