import FontDownloadIcon from '@mui/icons-material/FontDownload';
import ForumIcon from '@mui/icons-material/Forum';
import HealingIcon from '@mui/icons-material/Healing';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import LaunchIcon from '@mui/icons-material/Launch';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsSuggest from '@mui/icons-material/SettingsSuggest';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';

/**
 * TODO leverage the global config to populate all content for this component.
 * Ideally, we will have a `LinksContainer` which reads the config, and a `LinksPresenter`,
 * which takes the required config props in as its props.
 */
export default function Greetings() {
    return (
        <div className="page">
            <ScrollToTop />
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Links</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                <h2>
                    Tŝilhqot’in National Government <LaunchIcon />{' '}
                </h2>
                <p>
                    This website is an undertaking of the{' '}
                    <a href="https://tsilhqotin.ca" target={'_blank'} rel={'noopener noreferrer'}>
                        Tŝilhqot’in National Government
                    </a>
                    .
                </p>
                <h2>
                    Other Language Resources <SettingsSuggest />{' '}
                </h2>
                <p>
                    {' '}
                    Here are some links to some external resources published on the web by others
                    working on language.{' '}
                </p>
                <h2>
                    Linda Smith’s M.A. Thesis <LibraryBooksIcon />{' '}
                </h2>
                <p>
                    <a
                        href="https://dspace.library.uvic.ca/bitstream/handle/1828/934/Linda%20Smith%20Niminh%20thesis%202008.pdf?sequence=1&isAllowed=y"
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        Here
                    </a>{' '}
                    is a link to Linda Smith’s thesis “Súwh-tŝ’éghèdúdính: the Tsìnlhqút’ín Nímính
                    Spiritual Path”. Linda completed her Master of Arts degree at the{' '}
                    <a href="https://www.uvic.ca/" target={'_blank'} rel="noreferrer">
                        {' '}
                        University of Victoria
                    </a>
                    .
                </p>

                <h2>
                    YouTube Videos <VideoLibraryRoundedIcon />{' '}
                </h2>
                <p>
                    Diabetes <HealingIcon />{' '}
                </p>
                <p>
                    <a
                        href="https://www.youtube.com/watch?v=t2zt1JVtdj0&feature=youtu.be"
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        Here
                    </a>{' '}
                    is a presentation about diabetes by Betty Lulua and Catherine Haller. It is a
                    good resource for Tŝilhqot’in speakers to learn about diabetes, and for young
                    people to learn Tŝilhqot’in. There are pictures and bullet-point translations
                    that make it easy to follow the discussion.
                </p>

                <h2>
                    Tŝilhqot’in Dialogue <ForumIcon />{' '}
                </h2>
                <p>
                    <a
                        href="https://youtu.be/BW4551zAfHI"
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        This
                    </a>{' '}
                    cartoon has a dialogue between ant and bear. It teaches introductions and
                    farewells. By Grant Alphonse and HungryBoy productions.
                </p>

                <h2>
                    First Voices <LaunchIcon />{' '}
                </h2>
                <p>
                    <a
                        href="https://www.firstvoices.com/explore/FV/sections/Data/Athabascan/Tsilhqot%27in%20(Xeni%20Gwet%27in)/Tsilhqot%27in%20(Xeni%20Gwet%27in)"
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        Here
                    </a>{' '}
                    is a link to the Xeni Gwet’in language portal on First Voices. Click “Learn our
                    language” to get started. There is a dictionary with many words and phrases as
                    well as stories and songs. These excellent resources for learners were put
                    together by the Jeni Huten Language Committee.
                </p>

                <h2>
                    Unicode Keyboard <KeyboardIcon />{' '}
                </h2>
                <p>
                    <a
                        href="https://languagegeek.com/lgwp/keyboards/"
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        Here
                    </a>{' '}
                    is a link to the keyboards by Language Geek. Scroll down to find the download
                    and installation instructions for Tŝilhqot’in (under “Alberta, BC, Sask.
                    Athabaskan”). This keyboard will allow you to send your work to others without
                    losing special characters; you don’t have to have the keyboard installed on your
                    system to see the special characters. It allows you to place caps on consonants
                    (including capital letters: Ŝŝ), insert “ɨ” or “ʔ”, and to mark tone (e.g. á).{' '}
                </p>

                <h2>
                    {' '}
                    Font Conversion <FontDownloadIcon />{' '}
                </h2>
                <p>
                    For the more technically inclined- Aidan Pine put together{' '}
                    <a
                        href="https://github.com/roedoejet/convertextract"
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        convertextract
                    </a>
                    , a really cool tool that can be used to batch convert documents to Unicode.
                </p>
            </div>
        </div>
    );
}
