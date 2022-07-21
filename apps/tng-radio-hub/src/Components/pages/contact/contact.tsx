import './contact.module.css';

/* eslint-disable-next-line */
export interface ContactProps {}

export function Contact() {
    return (
        <div className="contact">
      <div className="backDrop">
        <h1>Contacts</h1>
        <h2>Racine Jeff</h2>
        <p>Radio manager</p>
        <h2>Kirsten Lees</h2>
        <p>Administration assistant</p>
        <h2>Nikhilesh Kondur</h2>
        <p>Studio technician</p>
        <h2>Braeden Boyd</h2>
        <p>Digitization technician</p>
        <h2>Blake Sellars</h2>
        <p>Radio technical assistant</p>
      </div>
    </div>
    );
}

export default Contact;
