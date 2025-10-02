
import React from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { GitHubIcon, ExternalLinkIcon } from './Icons';

const projects: Project[] = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform built with Next.js, Stripe for payments, and Tailwind CSS. Users can browse products, add to cart, and complete checkout.',
    tags: ['Next.js', 'React', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    image: 'https://picsum.photos/seed/project1/600/400',
    githubUrl: 'https://github.com/your-username/your-repo',
    liveUrl: '#',
  },
  {
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates using Firebase. Features include drag-and-drop boards, user authentication, and notifications.',
    tags: ['React', 'Firebase', 'Redux', 'Material-UI'],
    image: 'https://picsum.photos/seed/project2/600/400',
    githubUrl: 'https://github.com/your-username/your-repo',
    liveUrl: '#',
  },
  {
    title: 'Data Visualization Dashboard',
    description: 'A dashboard for visualizing complex datasets using D3.js and React. It provides interactive charts and filters to explore data patterns effectively.',
    tags: ['React', 'D3.js', 'Node.js', 'Express'],
    image: 'https://picsum.photos/seed/project3/600/400',
    githubUrl: 'https://github.com/your-username/your-repo',
    liveUrl: '#',
  },
];

const SectionTitle: React.FC<{ number: number; title: string }> = ({ number, title }) => (
    <h2 className="text-2xl md:text-3xl font-bold text-lightest-slate flex items-center whitespace-nowrap mb-8">
        <span className="text-brand font-mono mr-4 text-xl md:text-2xl">0{number}.</span>
        {title}
        <span className="block w-full md:w-64 h-px bg-lightest-navy ml-4"></span>
    </h2>
);

const Projects: React.FC = () => {
  return (
    <section id="projects" className="py-24">
      <SectionTitle number={2} title="Things I've Built" />
      <div className="space-y-16">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} alignment={index % 2 === 0 ? 'left' : 'right'} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
