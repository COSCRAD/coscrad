import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import buildBilingualTitle from '../../../app/utilities/buildBilingualTitle';

export type MediaData = {
    id: string;

    title: string;

    titleEnglish: string;

    url: string;
};

export function Media({ id, title, titleEnglish, url }: MediaData) {
    return (
        <div>
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle"> {buildBilingualTitle(title, titleEnglish)}</h1>
                </div>
            </div>
            <Card variant="outlined" className="appCard">
                <CardContent>
                    <CardMedia className="audioPlayer">
                        <video width="300" controls>
                            <source src={url} type="video/mp4" />
                        </video>
                    </CardMedia>
                    <Typography className="cardDetail" component="div">
                        <div>Title: {title}</div>
                        <div>English: {titleEnglish}</div>
                        <source src={url} type="video/mp4" />
                        <div>ID: {id}</div>
                    </Typography>
                    <Button href={url} className="downloadMedia">
                        Download
                        <FileDownloadRoundedIcon />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
