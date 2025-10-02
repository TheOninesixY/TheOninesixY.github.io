
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="min-h-screen flex flex-col justify-center items-start">
      <div className="max-w-4xl">
        <p className="text-brand font-mono text-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>Hi, my name is</p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-lightest-slate mt-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Your Name.
        </h1>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate mt-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          I build things for the web.
        </h2>
        <p className="text-slate max-w-xl mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          I'm a software engineer specializing in building (and occasionally designing) exceptional digital experiences. Currently, I’m focused on building accessible, human-centered products.
        </p>
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <a
            href="#projects"
            className="text-brand border border-brand rounded px-8 py-4 font-mono text-lg hover:bg-brand/10 transition-colors"
          >
            Check out my projects!
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
