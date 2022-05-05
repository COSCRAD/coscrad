import './Songs.module.css';

/* eslint-disable-next-line */
export interface SongsProps {}

export function Songs(props: SongsProps) {
    return (
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Songs</h1>
                </div>
            </div>
        </div>
    );
}

export default Songs;
