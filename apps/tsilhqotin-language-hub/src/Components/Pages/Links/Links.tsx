import './Links.module.css';

/* eslint-disable-next-line */
export interface LinksProps {}

export function Links(props: LinksProps) {
    return (
        <div style={{ padding: '12px', paddingTop: '0' }}>
            <h1>Links</h1>
            <p>Tŝilhqot’in National Government</p>
            <p>
                This website is an undertaking of the{' '}
                <a href="https://tsilhqotin.ca">Tŝilhqot’in National Government</a>.
            </p>
            <p>Other Language Resources</p>
            Here are some links to some external resources published on the web by others working on
            language.
            <p>Linda Smith’s M.A. Thesis</p>
            <p>
                <a
                    href="https://dspace.library.uvic.ca/bitstream/handle/1828/934/Linda%20Smith%20Niminh%20thesis%202008.pdf?sequence=1&isAllowed=y"
                    target={'_blank'}
                >
                    Here
                </a>{' '}
                is a link to Linda Smith’s thesis “Súwh-tŝ’éghèdúdính: the Tsìnlhqút’ín Nímính
                Spiritual Path”. Linda completed her Master of Arts degree at the{' '}
                <a href="https://www.uvic.ca/" target={'_blank'}>
                    {' '}
                    University of Victoria
                </a>
                .
            </p>
            <p>YouTube Videos </p>
            <p>Diabetes</p>
            <p>
                <a
                    href="https://www.youtube.com/watch?v=t2zt1JVtdj0&feature=youtu.be"
                    target={'_blank'}
                >
                    Here
                </a>{' '}
                is a presentation about diabetes by Betty Lulua and Catherine Haller. It is a good
                resource for Tŝilhqot’in speakers to learn about diabetes, and for young people to
                learn Tŝilhqot’in. There are pictures and bullet-point translations that make it
                easy to follow the discussion.
            </p>
            <p>Tŝilhqot’in Dialogue</p>
            <p>
                <a href="https://youtu.be/BW4551zAfHI" target={'_blank'}>
                    This
                </a>{' '}
                cartoon has a dialogue between ant and bear. It teaches introductions and farewells.
                By Grant Alphonse and HungryBoy productions.
            </p>
            <p>First Voices</p>
            <p>
                <a
                    href="https://www.firstvoices.com/explore/FV/sections/Data/Athabascan/Tsilhqot%27in%20(Xeni%20Gwet%27in)/Tsilhqot%27in%20(Xeni%20Gwet%27in)"
                    target="_blank"
                >
                    Here
                </a>{' '}
                is a link to the Xeni Gwet’in langauge portal on First Voices. Click “Learn our
                language” to get started. There is a dictionary with many words and phrases as well
                as stories and songs. These excellent resources for learners were put together by
                the Jeni Huten Language Committee.
            </p>
            <p>Unicode Keyboard </p>
            <p>
                <a href="http://www.languagegeek.com/dene/keyboards/romdene.html" target={'_blank'}>
                    Here
                </a>{' '}
                is a link to the keyboards by Language Geek. Scroll down to find the download and
                installation instructions for Tŝilhqot’in (under “Alberta, BC, Sask. Athabaskan”).
                This keyboard will allow you to send your work to others without losing special
                characters; you don’t have to have the keyboard installed on your system to see the
                special characters. It allows you to place caps on consonants (including capital
                letters: Ŝŝ), insert “ɨ” or “ʔ”, and to mark tone (e.g. á).{' '}
            </p>
            <p> Font Conversion </p>
            <p style={{ margin: '0' }}>
                For the more technically inclined- Aidan Pine put together{' '}
                <a href="https://github.com/roedoejet/convertextract" target={'_blank'}>
                    convertextract
                </a>
                , a really cool tool that can be used to batch convert documents to Unicode.
            </p>
        </div>
    );
}

export default Links;
