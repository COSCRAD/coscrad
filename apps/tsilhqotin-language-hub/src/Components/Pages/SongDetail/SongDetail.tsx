import { IDetailQueryResult, ISongViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGlobalConfig } from '../../../Configs/global.config';
import { getConfig } from '../../../config';
import SongData, { Song } from '../../Widgets/Song/Song';
import './SongDetail.module.css';

type ComponentState = {
    songData: null | (IDetailQueryResult<ISongViewModel> & Pick<SongData, 'creditsMap'>);
};

export function SongDetail() {
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
                setComponentState({
                    songData: {
                        ...song,
                        creditsMap: new Map(Object.entries(getGlobalConfig().songIdToCredits)),
                    },
                });
            })
            .catch((rej) => console.log(rej));
    }, [setComponentState]);

    if (!componentState.songData) return <div className="page">LOADING!</div>;

    return (
        <Song
            songData={{
                ...componentState.songData,
                title: componentState.songData.name.items.find(
                    ({ languageCode }) => languageCode === LanguageCode.Chilcotin
                )?.text,
                titleEnglish: componentState.songData.name.items.find(
                    ({ languageCode }) => languageCode === LanguageCode.English
                )?.text,
            }}
        ></Song>
    );
}

export default SongDetail;
