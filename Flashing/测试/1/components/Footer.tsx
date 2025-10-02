
import React from 'react';
import { GitHubIcon, LinkedInIcon, TwitterIcon } from './Icons';

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/your-username', icon: <GitHubIcon className="w-5 h-5" /> },
  { name: 'LinkedIn', url: '#', icon: <LinkedInIcon className="w-5 h-5" /> },
  { name: 'Twitter', url: '#', icon: <TwitterIcon className="w-5 h-5" /> },
];

const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center">
      <div className="md:hidden flex justify-center items-center space-x-6 mb-4">
          {socialLinks.map(link => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-light-slate hover:text-brand transition-colors">
                  {link.icon}
              </a>
          ))}
      </div>
      <p className="font-mono text-sm text-slate">
        Designed & Built by Your Name.
      </p>
      <p className="font-mono text-xs text-light-slate mt-1">
        Inspired by Brittany Chiang's portfolio.
      </p>
    </footer>
  );
};

export default Footer;
