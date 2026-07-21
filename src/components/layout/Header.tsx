import React from 'react';
import CardNav from './CardNav';

const Header: React.FC = () => {
  const navItems = [
    {
      label: "AI Tools",
      bgColor: "#5E3BEE", 
      textColor: "#fff",
      links: [
        { label: "Sign Detection", href: "/sign-detection" },
        { label: "Translation", href: "/translation" },
        { label: "Signing Demo", href: "/demo" } 
      ]
    },
    {
      label: "Learn",
      bgColor: "#FFD89C", 
      textColor: "#2D1A4A",
      links: [
        { label: "Lessons", href: "/Learn" },
        { label: "Community", href: "/community" }
      ]
    },
    {
      label: "Account",
      bgColor: "#2D1A4A", 
      textColor: "#fff",
      links: [
        { label: "Log In", href: "/login" },
        { label: "Sign Up", href: "/signup" },
        { label: "Log Out", href: "/logout" }
      ]
    }
  ];

  return (
    <header>
      <CardNav
        items={navItems}
        logoAlt="Instrumate"
        baseColor="#FAF9F6"
        buttonBgColor="#5E3BEE"
        buttonTextColor="#fff"
      />
    </header>
  );
};

export default Header;