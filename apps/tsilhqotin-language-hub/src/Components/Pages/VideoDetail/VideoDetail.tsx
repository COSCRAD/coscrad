import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConfig } from '../../../config';
import { Media, MediaData } from '../../Widgets/Media/Media';

type ComponentState = {
    mediaData: null | MediaData;
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
                setComponentState({ mediaData: media.data });
            })
            .catch((rej) => console.log(rej));
    }, [setComponentState]);

    if (!componentState.mediaData) return <div>LOADING!</div>;

    return <Media {...componentState.mediaData}></Media>;
}
