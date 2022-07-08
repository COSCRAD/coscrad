import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import './Apps.module.css';

/* eslint-disable-next-line */
export interface AppsProps {}

export function Apps(props: AppsProps) {
    const bull = (
        <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}>
            •
        </Box>
    );
    return (
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Apps</h1>
                </div>
            </div>
            <Card className="pageContent">
                <Card variant="outlined" className="appCard">
                    <CardContent>
                        <Typography variant="h5" component="div">
                            Digital Phrasebook v1.0
                        </Typography>

                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            released 2022
                        </Typography>
                        <Typography variant="body2" color="Highlight">
                            Version 1.0 is currently published and contains 'Third Person Singular
                            Paradigms' completed Bella Alphonse. These are really helpful for
                            semi-speakers who need practice with verb stem alternations. To date
                            over 100,000 phrases have been recorded, with about 50,000 named and
                            organized. Version 2.0 of this app will allow us to present this
                            material to learners. This is the main focus of the tech team for
                            2021-2022.
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ alignContent: 'center', textAlign: 'center' }}>
                        <img
                            id="googlePlay"
                            alt="Get it on Google Play"
                            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                            width="200px"
                        />
                    </CardActions>
                </Card>
            </Card>
        </div>
    );
}

export default Apps;
