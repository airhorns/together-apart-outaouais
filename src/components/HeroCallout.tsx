import React from "react";

export const HeroCallout = (props: { heading: React.ReactNode; children: React.ReactNode }) => (
  <div className="hero-section">
    <div className="container">
      <div className="hero-content">
        <h1 className="hero-heading">{props.heading}</h1>
        <div className="paragraph-container">
          <p className="hero-paragraph">{props.children}</p>
        </div>
      </div>
    </div>
  </div>
);

export const SupportLocalCallout = () => (
  <HeroCallout heading="Support local businesses when you can.">
    With retailers and restaurants in Ottawa temporarily shut down due to COVID-19, many folks are struggling. This site is meant to be a
    resource for the residents of this city to find local spots to order from and support.
  </HeroCallout>
);