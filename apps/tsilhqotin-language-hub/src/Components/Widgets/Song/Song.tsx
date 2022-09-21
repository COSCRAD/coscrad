import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import buildBilingualTitle from '../../../app/utilities/buildBilingualTitle';

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
                    <h1 id="pageTitle"> {buildBilingualTitle(title, titleEnglish)}</h1>
                </div>
            </div>
            <Card variant="outlined" className="appCard">
                <MusicNoteIcon className="songIcon" />
                <CardContent>
                    <Typography className="cardDetail" color={'white'} component="div">
                        <div>Title: {title}</div>
                        <div>English: {titleEnglish}</div>
                        <div>Contributions: {`${contributions}`}</div>
                        <div>Lyrics: {`${lyrics || ''}`}</div>
                        <div>ID: {`${id}`} </div>
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
