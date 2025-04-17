import React from 'react';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Desmo. All rights reserved.</p>
        <p>This site does not store any files on its server. All content is provided by non-affiliated third parties.</p>
      </div>
    </footer>
  );
};

export default Footer;