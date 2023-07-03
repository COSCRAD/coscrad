import { IMediaItemViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGlobalConfig } from '../../../Configs/global.config';
import { getConfig } from '../../../config';
import { Media, MediaData } from '../../Widgets/Media/Media';

type ComponentState = {
    mediaData: null | (IMediaItemViewModel & Pick<MediaData, 'creditsMap'>);
};

export default function MediaDetail() {
    const [componentState, setComponentState] = useState<ComponentState>({
        mediaData: null,
    });

    const { id } = useParams();

    useEffect(() => {
        setComponentState({ mediaData: null });

        const apiUrl = `${getConfig().apiBaseUrl}/api/resources/mediaItems/${id}`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((media) => {
                setComponentState({
                    mediaData: {
                        ...media,
                        creditsMap: new Map(Object.entries(getGlobalConfig().videoIdToCredits)),
                    },
                });
            })
            .catch((rej) => console.log(rej));
    }, [setComponentState]);

    if (!componentState.mediaData) return <div className="page">LOADING!</div>;

    return (
        <Media
            {...componentState.mediaData}
            title={
                componentState.mediaData.name.items.find(
                    ({ languageCode }) => languageCode === LanguageCode.Chilcotin
                )?.text
            }
            titleEnglish={
                componentState.mediaData.name.items.find(
                    ({ languageCode }) => languageCode === LanguageCode.English
                )?.text
            }
        ></Media>
    );
}
