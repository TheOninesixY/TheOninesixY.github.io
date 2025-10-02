
import React from 'react';

const skills = [
  'JavaScript (ES6+)', 'TypeScript', 'React', 'Node.js', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Firebase', 'Python', 'Git & GitHub'
];

const SectionTitle: React.FC<{ number: number; title: string }> = ({ number, title }) => (
    <h2 className="text-2xl md:text-3xl font-bold text-lightest-slate flex items-center whitespace-nowrap mb-8">
        <span className="text-brand font-mono mr-4 text-xl md:text-2xl">0{number}.</span>
        {title}
        <span className="block w-full md:w-64 h-px bg-lightest-navy ml-4"></span>
    </h2>
);

const About: React.FC = () => {
  return (
    <section id="about" className="py-24">
        <SectionTitle number={1} title="About Me" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
        <div className="md:col-span-3 text-light-slate space-y-4">
          <p>
            Hello! My name is Your Name and I enjoy creating things that live on the internet. My interest in web development started back in 2012 when I decided to try editing custom Tumblr themes — turns out hacking together a custom reblog button taught me a lot about HTML & CSS!
          </p>
          <p>
            Fast-forward to today, and I’ve had the privilege of working at an advertising agency, a start-up, a huge corporation, and a student-led design studio. My main focus these days is building inclusive and accessible products and digital experiences for a variety of clients.
          </p>
          <p>Here are a few technologies I’ve been working with recently:</p>
          <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
            {skills.map((skill) => (
              <li key={skill} className="flex items-center">
                <span className="text-brand mr-2">▹</span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 relative group w-full max-w-xs mx-auto">
          <div className="absolute -top-2 -left-2 w-full h-full border-2 border-brand rounded transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"></div>
          <img
            src="https://picsum.photos/seed/portfolio-pic/500/500"
            alt="Your Name"
            className="rounded w-full h-full object-cover z-10 relative filter grayscale hover:filter-none transition-all duration-300"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
