import './Greetings.module.css';

/* eslint-disable-next-line */
export interface GreetingsProps {}

export function Greetings(props: GreetingsProps) {
    return (
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Greetings</h1>
                </div>
            </div>
        </div>
    );
}

export default Greetings;
