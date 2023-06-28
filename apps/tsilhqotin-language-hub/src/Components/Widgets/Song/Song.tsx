import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { Button, Card, CardContent, CardMedia, Divider, Typography } from '@mui/material';
import buildBilingualTitle from '../../../app/utilities/buildBilingualTitle';
import './Song.css';

export type SongData = {
    id: string;

    title: string;

    titleEnglish?: string;

    // pulled from the config above
    creditsMap: Map<string, string>;

    lyrics?: string;

    audioURL: string;
};

/* eslint-disable-next-line */
export interface SongsDetailComponentProps {
    songData: SongData;
}

export function Song(props: SongsDetailComponentProps) {
    const { songData } = props;

    const { id, title, titleEnglish, creditsMap, lyrics, audioURL } = songData;

    return (
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle"> {buildBilingualTitle(title, titleEnglish)}</h1>
                </div>
            </div>
            <Card variant="outlined" className="appCard">
                <MusicNoteIcon className="songIcon" />
                <CardContent>
                    <Typography className="cardDetail" color={'white'} component="div">
                        <div>Title: {buildBilingualTitle(title, titleEnglish)}</div>
                        <Divider id="detail-divider" />
                        <div>
                            Credits: {creditsMap.has(id) ? creditsMap.get(id) : 'NO CREDITS LISTED'}
                        </div>
                        {lyrics && <div>Lyrics: {`${lyrics || ''}`}</div>}
                    </Typography>
                    <CardMedia>
                        <audio className="audioPlayer" src={`${audioURL}`} controls></audio>
                    </CardMedia>
                    <Button href={audioURL} className="downloadMedia">
                        Download
                        <FileDownloadRoundedIcon />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default SongData;
