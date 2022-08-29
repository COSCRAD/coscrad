import { Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';

export function AppsDetail() {
    const appData = [
        {
            name: 'Digital Phrasebook v1.0',
            image: 'https://www.tsilhqotin.ca/wp-content/uploads/2022/08/dpb_logo8.png',
            meta: 'released 2022',
            description:
                "Tŝilhqot'in Dictionary Project contains over 10,000 words and paradigms. *Logo is a prototype",
            links: {
                google: 'https://play.google.com/tsilhqotin',
                web: 'https://weblink.com/tsilhqotin',
            },
        },
        {
            name: 'Digital Verb Book',
            image: 'https://api.tsilhqotinlanguage.ca/uploads/app_icon_dvb_483177a8a0.png',
            meta: 'released 2018',
            description:
                'Version 1.0 is currently published and contains "Third Person Singular Paradigms" completed Bella Alphonse. These are really helpful for semi-speakers who need practice with verb stem alternations. To date over 100,000 phrases have been recorded, with about 50,000 named and organized. Version 2.0 of this app will allow us to present this material to learners. This is the main focus of the tech team for 2021-2022. ',
            links: {
                google: 'https://play.google.com/tsilhqotin',
                web: 'https://weblink.com/tsilhqotin',
            },
        },
        {
            name: 'Tŝilhqotin Memory Match',
            image: 'https://api.tsilhqotinlanguage.ca/uploads/app_icon_mm_a31a1eebd4.png',
            meta: 'released 2018',
            description:
                'The Memory Match game is one of Bella’s favourite activities to bring to the schools. That inspired this digital app where you can build your vocabulary as you look for matches. The current version features Bella Alphonse’s original 6 rounds (also found on the web version) and an additional 6 rounds completed by Maria Myers. Aaron picked a collection of pictures for Maria to describe that included many common or interesting verbs. We hope more speakers will contribute additional rounds in the future. This app is a favourite among Tŝilhqot’in children. ',
            links: {
                google: 'https://play.google.com/tsilhqotin',
                web: 'https://weblink.com/tsilhqotin',
            },
        },
        {
            name: 'Tŝilhqotin Alphabet',
            image: 'https://api.tsilhqotinlanguage.ca/uploads/app_icon_alphabet_25678c6c86.png',
            meta: 'released 2018',
            description:
                'This app goes along with the modernized Tŝilhqot’in Alphabet Poster. It can be used as a ’cheat sheet’ for the poster. ',
            links: {
                google: 'https://play.google.com/tsilhqotin',
                web: 'https://weblink.com/tsilhqotin',
            },
        },
        {
            name: 'Qungh ʔAnaghunt’in',
            image: 'https://api.tsilhqotinlanguage.ca/uploads/app_icon_qa_c3241de386.png',
            meta: 'released 2022',
            description:
                'This is a prototype for an interactive language learning game. We hope to expand upon this someday. ',
            links: {
                google: 'https://play.google.com/tsilhqotin',
                web: 'https://weblink.com/tsilhqotin',
            },
        },
    ];

    const listItems = appData.map((d) => (
        <Card variant="outlined" className="appCard" key={d.name}>
            <CardContent>
                <Typography color={'white'} variant="h5" component="div">
                    {d.name}
                </Typography>
                <Typography className="appMeta" color="red">
                    {d.meta}
                </Typography>

                <CardMedia className="appImage" component={'img'} image={d.image} />

                <Typography className="appDescription" variant="body2" color={'white'}>
                    {d.description}
                </Typography>
                <CardActions className="cardLink">
                    <a className="appLink" href={d.links.google}>
                        <img
                            id="googlePlay"
                            alt="Get it on Google Play"
                            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                            width="200px"
                        />
                    </a>
                </CardActions>
                <CardActions className="cardLink">
                    <img
                        className="webLink"
                        id="googlePlay"
                        alt="web version"
                        src="https://www.tsilhqotin.ca/wp-content/uploads/2021/01/web_verson_icon.png"
                        width="160px"
                    />
                </CardActions>
            </CardContent>
        </Card>
    ));

    return <div>{listItems}</div>;
}
