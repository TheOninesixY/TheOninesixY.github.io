
import React from 'react';
import { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon } from './Icons';

interface ProjectCardProps {
  project: Project;
  alignment: 'left' | 'right';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, alignment }) => {
  const isAlignedLeft = alignment === 'left';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center`}>
      {/* Image */}
      <div className={`relative md:col-span-7 group ${isAlignedLeft ? 'md:order-1' : 'md:order-2'}`}>
        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="block">
          <div className="absolute inset-0 bg-brand/30 rounded-md z-10 group-hover:bg-transparent transition-colors duration-300"></div>
          <img src={project.image} alt={project.title} className="rounded-md w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300" />
        </a>
      </div>

      {/* Content */}
      <div className={`md:col-span-5 z-20 ${isAlignedLeft ? 'md:order-2 md:text-right' : 'md:order-1 md:text-left'}`}>
        <p className="text-brand font-mono text-sm">Featured Project</p>
        <h3 className="text-2xl font-bold text-lightest-slate hover:text-brand transition-colors mt-2">
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            {project.title}
          </a>
        </h3>
        <div className="bg-light-navy p-6 rounded-md shadow-lg my-4">
          <p className="text-light-slate">{project.description}</p>
        </div>
        <ul className={`flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-slate ${isAlignedLeft ? 'md:justify-end' : 'md:justify-start'}`}>
          {project.tags.map(tag => <li key={tag}>{tag}</li>)}
        </ul>
        <div className={`flex items-center gap-4 mt-4 ${isAlignedLeft ? 'md:justify-end' : 'md:justify-start'}`}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-light-slate hover:text-brand transition-colors">
              <GitHubIcon className="w-6 h-6" />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-light-slate hover:text-brand transition-colors">
              <ExternalLinkIcon className="w-6 h-6" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
