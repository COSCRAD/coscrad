import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Media, MediaData } from '../Media/Media';

export interface MediaViewModel {}

type ComponentState = {
    mediaData: null | MediaData;
};

export function MediaDetail(props: MediaViewModel) {
    const [componentState, setComponentState] = useState<ComponentState>({
        mediaData: null,
    });

    const { id } = useParams();

    useEffect(() => {
        setComponentState({ mediaData: null });

        const apiUrl = `http://localhost:3131/api/resources/mediaItems/${id}`;
        fetch(apiUrl, { mode: 'cors' })
            .then((res) => res.json())
            .then((media) => {
                setComponentState({ mediaData: media.data });
            })
            .catch((rej) => console.log(rej));
    }, [setComponentState]);

    if (!componentState.mediaData) return <div>LOADING!</div>;

    return <Media mediaData={componentState.mediaData}></Media>;
}
