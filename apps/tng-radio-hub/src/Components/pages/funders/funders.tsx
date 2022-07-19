import './funders.module.css';

/* eslint-disable-next-line */
export interface FundersProps {}

export function Funders(props: FundersProps) {
    return (
      <div className="funders">
      <div className="backDrop">
        <h1>Language Program</h1>

        <h2>
          {" "}
          <a
            className="fundersLink"
            href="https://www.firstvoices.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            First Voices{" "}
          </a>
        </h2>

        <h2>
          {" "}
          <a
            className="fundersLink"
            href="https://nrc.canada.ca/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            National Research Council{" "}
          </a>
        </h2>

        <h2>
          {" "}
          <a
            className="fundersLink"
            href="https://www.bac-lac.gc.ca/eng/discover/aboriginal-heritage/initiatives/listen/Pages/funding1.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            Listen, Hear Our Voices
          </a>
        </h2>

        <h1>Community Radio Project</h1>

        <h2>
          {" "}
          <a
            className="fundersLink"
            href="https://www.canada.ca/en/canadian-heritage/services/funding/aboriginal-peoples/northern-broadcasting.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Northern Aboriginal Broadcasting{" "}
          </a>
        </h2>

        <h2>
          {" "}
          <a
            className="fundersLink"
            href="https://fpcc.ca/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            First Peoples Cultural Council{" "}
          </a>
        </h2>

        <h2>
          {" "}
          <a
            className="fundersLink"
            href="https://www.ccatec.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cariboo Chilcotin Aboriginal Training Employment Centre{" "}
          </a>
        </h2>
      </div>
    </div>
    );
}

export default Funders;
