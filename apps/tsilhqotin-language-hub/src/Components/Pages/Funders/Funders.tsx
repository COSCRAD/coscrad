import { Card, Divider } from '@mui/material';

/* eslint-disable-next-line */
export interface FundersProps {}

export function Funders(props: FundersProps) {
    return (
        <div className="page">
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Funders</h1>
                </div>
            </div>
            <Card className="pageContent">
                <h2 className="language">Language Program</h2>
                <Divider />

                <h3>National Research Council</h3>
                <p>
                    <a href="https://nrc.canada.ca/en" target={'_blank'} rel="noreferrer">
                        Here is a link to the NRC website.
                    </a>
                </p>
                <h3>Listen Hear Our Voices</h3>
                <p>
                    <a
                        href="https://www.bac-lac.gc.ca/eng/discover/aboriginal-heritage/initiatives/listen/Pages/default.aspx"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Here is a link to the LHOV website.
                    </a>
                </p>

                <h2 className="language">Community Radio Project</h2>
                <Divider />

                <h3>Northern Aboriginal Broadcasting</h3>
                <p>
                    <a
                        href="https://www.canada.ca/en/canadian-heritage/services/funding/aboriginal-peoples/northern-broadcasting.html"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Here is a link to the NAB website.
                    </a>
                </p>
                <h3>First Peoples Cultural Council</h3>
                <p>
                    <a href="http://www.fpcc.ca/" target="_blank" rel="noreferrer">
                        Here is a link to the FPCC website.
                    </a>
                </p>
                <h3>Cariboo Chilcotin Aboriginal Training Employment Centre</h3>
                <p>
                    <a href="http://www.ccatec.com/" target="_blank" rel="noreferrer">
                        Here is a link to CCATEC's website.
                    </a>
                </p>

                <h2 style={{ textAlign: 'center' }}>Previous Funders</h2>
                <Divider />

                <h3>Indigitization</h3>
                <p>
                    “The{' '}
                    <a href="https://www.indigitization.ca/" target="_blank" rel="noreferrer">
                        Indigitization Grant Program
                    </a>{' '}
                    is a grant funding opportunity sponsored by the Irving K. Barber Learning Centre
                    at the University of British Columbia, Museum of Anthropology at the University
                    of British Columbia, and the First Nations Technology Council.”
                </p>

                <h3>BC Capacity Initiative</h3>
                <p>
                    Our work has previously been funded in part through the{' '}
                    <a href="https://www.bccapacity.org/" target="_blank" rel="noreferrer">
                        BC Capacity Initiative
                    </a>{' '}
                    (BCCI).
                </p>

                <h3>Simon Fraser University First Nations Languages Centre</h3>
                <p>
                    We partnered with{' '}
                    <a href="https://www.sfu.ca/fnlc.html" target="_blank" rel="noreferrer">
                        SFU
                    </a>{' '}
                    as part of the 7 year project, First Nations Languages in the Twenty-first
                    Century: Looking Back, Looking Forward. This project was funded by a partnership
                    grant from the Social Sciences and Humanities Research Council (SSHRC).
                </p>

                <h3>New Relationship Trust</h3>
                <p style={{ margin: '0' }}>
                    The language videos "Ts’eman Ts’elhgen" and “ʔEts’eteqash” were produced by
                    William Myers as part of a project funded through the{' '}
                    <a
                        href="https://www.newrelationshiptrust.ca/initiatives/elders-youth/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {' '}
                        New Relationship Trust BC First Nation Elders & Youth Grant Initiative
                        2017-2018.
                    </a>
                </p>
            </Card>
        </div>
    );
}

export default Funders;
