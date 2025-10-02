
import React from 'react';
import { GitHubIcon, LinkedInIcon, TwitterIcon, InstagramIcon, CodepenIcon } from './Icons';

const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/your-username', icon: <GitHubIcon className="w-5 h-5" /> },
    { name: 'Instagram', url: '#', icon: <InstagramIcon className="w-5 h-5" /> },
    { name: 'Twitter', url: '#', icon: <TwitterIcon className="w-5 h-5" /> },
    { name: 'LinkedIn', url: '#', icon: <LinkedInIcon className="w-5 h-5" /> },
    { name: 'Codepen', url: '#', icon: <CodepenIcon className="w-5 h-5" /> },
];

const SocialLinks: React.FC = () => {
    return (
        <>
            {/* Left Side Socials */}
            <div className="hidden md:flex fixed bottom-0 left-10 w-10 flex-col items-center z-30">
                <ul className="flex flex-col items-center space-y-6">
                    {socialLinks.map(link => (
                        <li key={link.name}>
                            <a 
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-light-slate hover:text-brand transition-all duration-300 transform hover:-translate-y-1 block"
                                aria-label={link.name}
                            >
                                {link.icon}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="w-px h-24 bg-light-slate mt-6"></div>
            </div>

            {/* Right Side Email */}
            <div className="hidden md:flex fixed bottom-0 right-10 w-10 flex-col items-center z-30">
                <a 
                    href="mailto:your.email@example.com"
                    className="font-mono text-sm tracking-widest text-light-slate hover:text-brand transition-all duration-300 transform hover:-translate-y-1"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    your.email@example.com
                </a>
                <div className="w-px h-24 bg-light-slate mt-6"></div>
            </div>
        </>
    );
};

export default SocialLinks;
