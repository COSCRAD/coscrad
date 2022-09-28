import ContactInfo from './contactData/ContactInfo';

export function ContactInfoDisplay({ name, title, department }: ContactInfo) {
    return (
        <div>
            <p>
                {name}, {title}
            </p>
        </div>
    );
}
