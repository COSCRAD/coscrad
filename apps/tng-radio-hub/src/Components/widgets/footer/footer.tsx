import CopyrightIcon from "@mui/icons-material/Copyright";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import PhoneIcon from "@mui/icons-material/Phone";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Divider } from "@mui/material";
import './footer.module.css';
import Footer from './footerLogic';

/* eslint-disable-next-line */
export interface FooterProps {}

export function footer(props: FooterProps) {
    return (
        <div>
            <Footer>
      <Footer.Wrapper>
        <Footer.Row>
          <Footer.Column>
            <Footer.Titles>Hours</Footer.Titles>
            <Footer.Link>
              {" "}
              <div className="footerLink">Monday to Friday</div>
            </Footer.Link>
            <Footer.Link>
              {" "}
              <div className="footerLink">
                8:30am - 12:00pm <br /> 1:00pm - 4:30pm{" "}
              </div>
            </Footer.Link>
          </Footer.Column>
          <Footer.Column>
            <Footer.Titles>Links</Footer.Titles>
            <Footer.Link>
              {" "}
              <a
                className="footerLink"
                href="https://www.tsilhqotin.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tŝilhqot’in National Government
              </a>
            </Footer.Link>
            <Footer.Link>
              {" "}
              <a
                className="footerLink"
                href="https://tsilhqotinlanguage.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tŝilhqot’in Language
              </a>
            </Footer.Link>
          </Footer.Column>
          <Footer.Column>
            <Footer.Titles>Contact Us</Footer.Titles>
            <Footer.Link>
              {" "}
              <div className="footerLink">
                {" "}
                Address <br /> 79A 3rd Ave N Williams Lake, BC V2G 4T4
              </div>
            </Footer.Link>
            <Footer.Link>
              {" "}
              <a className="footerLink" href="tel:7784121112">
                {" "}
                Number <PhoneIcon /> <br />
                778-412-1112
              </a>
            </Footer.Link>
          </Footer.Column>
          <Footer.Column>
            <Footer.Titles>Social</Footer.Titles>
            <Footer.Link>
              {" "}
              <a
                className="footerLink"
                href="https://www.facebook.com/TsilhqotinNationalGovernment/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                <FacebookRoundedIcon />
                Facebook
              </a>
            </Footer.Link>
            <Footer.Link>
              {" "}
              <a
                className="footerLink"
                href="https://github.com/Tsilhqot-in-National-Government"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                <GitHubIcon />
                Github
              </a>
            </Footer.Link>
            <Footer.Link>
              {" "}
              <a
                className="footerLink"
                href="https://www.youtube.com/channel/UC2-7dFH9j_3CoOf-Wl0EmeA/featured"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon />
                Youtube
              </a>
            </Footer.Link>
            <Footer.Link>
              {" "}
              <a
                className="footerLink"
                href="https://twitter.com/tsilhqotin"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
                Twitter
              </a>
            </Footer.Link>
          </Footer.Column>
        </Footer.Row>
        <Divider sx={{ background: "white" }} />
        <div className="copyright">
          <CopyrightIcon sx={{ verticalAlign: "sub" }} />
          2022 Tŝilhqot’in National Government. All Rights Reserved
        </div>
      </Footer.Wrapper>
    </Footer>
        </div>
    );
}

export default Footer;
