
import React, { useState, useEffect } from 'react';

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-light-navy/80 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto flex items-center justify-between p-4">
        <a href="#home" className="text-brand text-2xl font-mono font-bold hover:text-white transition-colors">
          YN
        </a>
        <nav className="flex items-center space-x-6">
          <ol className="hidden md:flex items-center space-x-6 text-lightest-slate">
            {navLinks.map((link, index) => (
              <li key={link.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <a href={link.href} className="font-mono hover:text-brand transition-colors">
                  <span className="text-brand mr-1">0{index + 1}.</span>
                  {link.name}
                </a>
              </li>
            ))}
          </ol>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-brand border border-brand rounded px-4 py-2 hover:bg-brand/10 transition-colors animate-fade-in-up"
            style={{ animationDelay: `${navLinks.length * 100}ms` }}
          >
            Resume
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
