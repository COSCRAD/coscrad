import { IIndexQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';

export const TranscribedAudioIndexPresenter = (
    indexResult: IIndexQueryResult<ITranscribedAudioViewModel>
) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data: transcribedAudioItems } = indexResult;

    return (
        <div>
            <h3>Transcribed Audio</h3>
            <div className="records-table">
                <table border={1} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <th>Link</th>
                            <th>Audio Length</th>
                            <th>Transcription</th>
                        </tr>
                        {transcribedAudioItems.map(({ data: transcribedAudio }) => (
                            <tr>
                                <td>
                                    <Link to={transcribedAudio.id}>View</Link>
                                </td>
                                <td>{transcribedAudio.length}</td>
                                <td>{transcribedAudio.plainText}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>
                    {JSON.stringify(
                        transcribedAudioItems.map(({ data }) => data),
                        null,
                        2
                    )}
                </pre>
            </div>
        </div>
    );
};
