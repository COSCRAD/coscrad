import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import './About.scss';

export function About() {
    return (
        <div className="page">
            <ScrollToTop />
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Dialect</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                <h2>Tŝilhqot’in Ch’ih Yaltɨg</h2>
                <div>
                    <h4 id="tsilhqotin">
                        Xenchuh ʔElhghaʔeyuwh Jid Gwetowh Gudzɨsh, ʔEguh Chuh Seʔagunt’ih
                    </h4>
                    <div id="translation">
                        Loose translation of Tŝilhqot’in Language - Respecting our Diversity
                    </div>
                    <div className="dialectAudio">
                        <audio
                            src="https://api.tsilhqotinlanguage.ca/uploads/1719_Bella_Alphonse_Respecting_Dialect_2_4d710497b9.mp3"
                            controls
                            className="dialectAudio"
                        />
                    </div>

                    <div>
                        <div className="divTitle">
                            Translation by Bella Alphonse with assistance from Aaron Plahn.
                        </div>
                        Nexwesiqi Tŝilhqot’in ch’ih yajelhtɨg ʔeguh najedetat’i. ʔEsdilagh gwet’in,
                        Tl’esqox-t’in, Tl’etinqox-t’in, Tŝi Deldel gwet’in, Xeni gwet’in, belh
                        Yuneŝit’in ʔeyen Tŝilhqot’in ch’ih yajelhtɨg hajint’ih. Xenchuh Tŝilhqot’in
                        ʔelhghaʔeyuwh jid gwetowh jeguzɨsh, ʔeguh chuh seʔagunt’ih. Naʔet’sen jid
                        gwetowh ts’eguzih hink’ed, lha gwa huyenilẑen chu, hink’an lha deni
                        ghanteẑindlux hanh. <br /> Lha ʔinlhanx dzanh su ʔegun jid yalhtɨg
                        hagunt’ih. ʔElhghaʔeyuwh jid gwetowh ts’eguzih. T’agultinqi yajelhtɨg,
                        sutsel ʔuẑilhtŝ’an; ʔeguh jid ʔigwedilʔanx hagwet’insh.
                    </div>
                    <div>
                        <h2>Tŝilhqot’in Language</h2>
                        <div className="divTitle">
                            Respecting Our Diversity by the Tŝilhqot’in Language Committee and Jay
                            Nelson{' '}
                        </div>{' '}
                        The Tŝilhqot’in language is valuable to our future generations, we need to
                        respect and acknowledge the diversity of the Tŝilhqot’in language dialects
                        of each community; Tl’esqox, Tŝi Deldel, Yuneŝit’in, ʔEsdilagh, Xeni
                        Gwet’in, and Tl’etinqox. <br /> When we use the term ’dialect’, we are not
                        referring to any ’correctness’ nor ’inaccuracies’ in how Tŝilhqot’in is
                        spoken, but simply acknowledging that the pronunciation may differ slightly
                        in each community. When our elders speak Tŝilhqot’in we listen and learn and
                        appreciate the richness of the different dialects.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
