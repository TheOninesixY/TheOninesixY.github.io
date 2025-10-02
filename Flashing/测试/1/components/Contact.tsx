
import React from 'react';

const SectionTitle: React.FC<{ number: number; title: string }> = ({ number, title }) => (
    <h2 className="text-2xl md:text-3xl font-bold text-lightest-slate flex items-center whitespace-nowrap mb-4">
        <span className="text-brand font-mono mr-4 text-xl md:text-2xl">0{number}.</span>
        {title}
    </h2>
);

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-24 text-center max-w-2xl mx-auto">
      <SectionTitle number={3} title="What's Next?" />
      <h3 className="text-4xl md:text-5xl font-bold text-lightest-slate mt-4">Get In Touch</h3>
      <p className="text-slate mt-4">
        Although I’m not currently looking for any new opportunities, my inbox is always open.
        Whether you have a question or just want to say hi, I’ll try my best to get back to you!
      </p>
      <div className="mt-12">
        <a
          href="mailto:your.email@example.com"
          className="text-brand border border-brand rounded px-8 py-4 font-mono text-lg hover:bg-brand/10 transition-colors"
        >
          Say Hello
        </a>
      </div>
    </section>
  );
};

export default Contact;
