import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConfig } from '../../../config';
import SongData, { Song } from '../../Widgets/Song/Song';
import './SongDetail.module.css';

/* eslint-disable-next-line */
export interface SongViewModel {}

type ComponentState = {
    songData: null | SongData;
};

export function SongDetail(props: SongViewModel) {
    const [componentState, setComponentState] = useState<ComponentState>({
        songData: null,
    });

    const { id } = useParams();

    useEffect(() => {
        setComponentState({ songData: null });

        const apiUrl = `${getConfig().apiBaseUrl}/api/resources/songs/${id}`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((song) => {
                setComponentState({ songData: song.data });
            })
            .catch((rej) => console.log(rej));
    }, [setComponentState]);

    if (!componentState.songData) return <div>LOADING!</div>;

    return <Song songData={componentState.songData}></Song>;
}

export default SongDetail;
