import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import './Teachers.css';

/* eslint-disable-next-line */
export interface TeachersProps {}

export function Teachers(props: TeachersProps) {
    return (
        <div className="page">
            <ScrollToTop />
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Teachers</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                <h2>Tŝilhqot’in Alphabet</h2>

                <p>
                    Here is a modernized version of the Tŝilhqot’in Alphabet. The word list and
                    pictures were compiled by Bella Alphonse with assistance from Aaron Plahn and
                    the template was designed by Aaron Plahn in Publisher. Thanks to Shane Doddridge
                    for suggesting Publisher for this purpose.
                </p>
                <iframe
                    className="alphabetPoster"
                    src="https://www.tsilhqotin.ca/wp-content/uploads/2022/09/Alphabet_v10.pdf"
                    frameBorder="0"
                ></iframe>

                <p>
                    Play the associated{' '}
                    <a
                        href="https://www.tsilhqotinlanguage.ca/game/Alphabet"
                        target="_blank"
                        rel="noreferrer"
                    >
                        game
                    </a>{' '}
                    on the web or download it as an App on{' '}
                    <a
                        href="https://play.google.com/store/apps/details?id=ca.tsilhqotinlanguage.tsilhqotinalphabet"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Google Play.
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Teachers;
