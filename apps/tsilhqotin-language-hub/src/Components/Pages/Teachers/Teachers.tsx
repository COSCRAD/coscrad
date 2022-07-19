import { Card } from '@mui/material';
import './Teachers.module.css';

/* eslint-disable-next-line */
export interface TeachersProps {}

export function Teachers(props: TeachersProps) {
    return (
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Teachers</h1>
                </div>
            </div>
            <Card className="pageContent">
                <p>
                    Here is a modernized version of the Tŝilhqot’in Alphabet. The word list and
                    pictures were compiled by Bella Alphonse with assistance from Aaron Plahn and
                    the template was designed by Aaron Plahn in Publisher. Thanks to Shane Doddridge
                    for suggesting Publisher for this purpose.
                </p>

                <p>
                    <a
                        href="http://www.tsilhqotinlanguage.ca/wp-content/uploads/2018/11/Alphabet_v10.pdf"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Alphabet_v10
                    </a>
                </p>

                <p>
                    Play the associated{' '}
                    <a
                        href="http://www.tsilhqotinlanguage.ca/game/Alphabet"
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
                        Google Play
                    </a>
                    .
                </p>
            </Card>
        </div>
    );
}

export default Teachers;
