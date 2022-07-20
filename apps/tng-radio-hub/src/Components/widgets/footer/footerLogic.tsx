import React, { ReactNode } from 'react';
import { Column, Container, Link, Row, Titles, Wrapper } from "./footer.module";

type HasChildren = {
    children: ReactNode;
}

export default function Footer({ children, ...restProps }: HasChildren) {
    return <Container {...restProps}>{children}</Container>;
  }
  
  Footer.Wrapper = function FooterWrapper({ children, ...restProps }: HasChildren) {
    return <Wrapper {...restProps}>{children}</Wrapper>;
  };
  
  Footer.Row = function FooterRow({ children, ...restProps }: HasChildren) {
    return <Row {...restProps}>{children}</Row>;
  };
  
  Footer.Column = function FooterColumn({ children, ...restProps }: HasChildren) {
    return <Column {...restProps}>{children}</Column>;
  };
  
  Footer.Link = function FooterLink({ children, ...restProps }: HasChildren) {
    return <Link {...restProps}>{children}</Link>;
  };
  
  Footer.Titles = function FooterTitles({ children, ...restProps }: HasChildren) {
    return <Titles {...restProps}>{children}</Titles>;
  };
  