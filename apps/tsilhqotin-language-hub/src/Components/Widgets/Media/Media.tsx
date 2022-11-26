import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { Button, Card, CardContent, CardMedia, Divider, Typography } from '@mui/material';
import buildBilingualTitle from '../../../app/utilities/buildBilingualTitle';

export type MediaData = {
    id: string;

    title: string;

    titleEnglish: string;

    url: string;

    creditsMap: Map<string, string>;
};

export function Media({ id, title, titleEnglish, url, creditsMap }: MediaData) {
    return (
        <div className="page">
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
                        <div>Title: {buildBilingualTitle(title, titleEnglish)}</div>
                        <Divider id="detail-divider" />
                        <source src={url} type="video/mp4" />
                        <div>
                            Credits: {creditsMap.has(id) ? creditsMap.get(id) : 'NO CREDITS LISTED'}
                        </div>
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
