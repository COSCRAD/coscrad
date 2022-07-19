import './about.module.css';

/* eslint-disable-next-line */
export interface AboutProps {}

export function About(props: AboutProps) {
    return (
<div className="about">
      <div className="backDrop">
        <h1>About</h1>
        <h2>We are an Indigenous broadcasting group</h2>
        <h4>
          supporting revitapzation and restoration of Tsilhqot’in language and
          culture while building on the need to discuss relevant <br />{" "}
          indigenous issues on a shareable platform to thousands across the
          country. <br />
          As the Tsilhqot’in Nation won Aboriginal Title in the Supreme Court of
          Canada- <br />a first in Canadian history- we broadcast important
          discussions relevant to First Nations, Inuit and Metis across Canada.
        </h4>
        <h2>Some of our governing principles</h2>

        <h4>
          • Promote the language, culture and customs of the Tsilhqot’in Nation{" "}
        </h4>
        <h4>
          • Promote broadcasting that reflects and represents the interests,
          cultures, <br />
          languages, music and pfestyles of the Tsilhqot’in people{" "}
        </h4>
        <h4>
          • Provide a platform for regional dialogue among members of the
          Tsilhqot’in Nation{" "}
        </h4>
        <h4>
          • Offer a platform for governments and other service providers to
          communicate information that includes education, <br />
          health and especially emergency response after the worst wildfires in
          British Columbia’s history.{" "}
        </h4>
        <h4>
          • Promote training opportunities for Tsilhqot’in members to be engaged
          in broadcasting, <br />
          production and technical services related to radio and television
          broadcasting.{" "}
        </h4>
        <h4>
          • Our programming and goals intend to not only inform, educate and
          entertain our community members pving on reserve but to do the same
          for off reserve members as well. <br />
          We use our programming to bring our communities and community members
          closer together through news updates about Tsilhqot’in Nation
          business,
          <br />
          language projects and community events. We are consistently aiming to
          bring Tsilhqot’in culture to the forefront of all events in our
          communities,
          <br />
          with many events broadcasted live on the internet for those not able
          to make it.
        </h4>
      </div>
    </div>
    );
}

export default About;
