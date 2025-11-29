import React from "react";
import { assets, features } from "../assets/assets";
import "./Bottombanner.css"; // Import normal CSS

function Bottombanner() {
  return (
    <div className="bottom-banner">
      <img
        className="banner-image desktop"
        src={assets.bottom_banner_image}
        alt="banner"
      />
      <img
        className="banner-image mobile"
        src={assets.bottom_banner_image_sm}
        alt="banner"
      />

      <div className="banner-content">
        <div>
          <h1 className="banner-title">Why We Are Best</h1>
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <img src={feature.icon} alt="icon" className="feature-icon" />
              <div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Bottombanner;
