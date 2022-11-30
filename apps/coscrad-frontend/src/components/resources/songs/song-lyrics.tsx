interface SongLyricsProps {
    lyrics: string;
}

export const SongLyrics = ({ lyrics }: SongLyricsProps): JSX.Element => (
    <div>
        <h3 className="detail-headers">Lyrics:</h3>
        {lyrics}
    </div>
);
