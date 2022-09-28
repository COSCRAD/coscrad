import ContactInfo from './contactData/ContactInfo';
import { ContactInfoDisplay } from './ContactInfoDisplay';

export interface ContactsDisplayProps {
    contactInfos: ContactInfo[];
}

export function ContactsDisplay({ contactInfos }: ContactsDisplayProps) {
    const listItems = contactInfos.map((contactInfo, index) => (
        <ContactInfoDisplay {...contactInfo} key={index.toString()} />
    ));

    return <div>{listItems}</div>;
}
