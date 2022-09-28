import DevicesIcon from '@mui/icons-material/Devices';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PlaceIcon from '@mui/icons-material/Place';
import { Divider } from '@mui/material';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import './Contact.css';
import { ContactsDisplay } from './ContactsDisplay';
import getContactInfos from './getContactInfos';

const contactInfosReadResult = getContactInfos();

export function Contact() {
    if (contactInfosReadResult instanceof Error)
        return (
            <div>
                <h1>Error Boundary</h1>
                <p>
                    This application has encountered the following error:
                    {contactInfosReadResult.message}
                </p>
            </div>
        );
    return (
        <div className="page">
            <ScrollToTop />
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Contact</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                <div id="address">
                    <h2 className="contactDetail">
                        Address <PlaceIcon />
                    </h2>
                    <p>79A 3rd Ave N</p>
                    <p>Williams Lake, BC V2G 4T4</p>

                    <h2 className="contactDetail">
                        Phone <LocalPhoneIcon />
                    </h2>
                    <p>778-412-1112</p>
                </div>

                <Divider className="divider" />

                <h2>
                    Language Technology Team <DevicesIcon />{' '}
                </h2>

                <ContactsDisplay contactInfos={contactInfosReadResult} />
            </div>
        </div>
    );
}

export default Contact;
