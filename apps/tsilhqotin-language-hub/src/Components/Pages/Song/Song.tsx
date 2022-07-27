import { Card } from '@mui/material';

export type SongData = {
    id: string;

    title: string;

    titleEnglish?: string;

    contributions: string;

    lyrics: string;

    audioURL: string;
};

/* eslint-disable-next-line */
export interface SongsDetailComponentProps {
    songData: SongData;
}

export function Song(props: SongsDetailComponentProps) {
    const { songData } = props;

    const { id, title, titleEnglish, contributions, lyrics, audioURL } = songData;

    return (
        <div>
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle"> {`${title || titleEnglish}`}</h1>
                </div>
            </div>
            <Card>
                <div>English: {titleEnglish}</div>
                <audio src={`${audioURL}`} controls />
                <div>Contributions: {`${contributions}`}</div>
                <div>Lyrics: {`${lyrics}`}</div>
                <div>URL: {`${audioURL}`}</div>
                <div>ID: {`${id}`} </div>
            </Card>
        </div>
    );
}

export default SongData;
