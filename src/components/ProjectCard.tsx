import Image from 'next/image';
import Link from 'next/link';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="relative h-48 w-full">
        {project.image ? (
          <Image 
            src={project.image} 
            alt={project.title} 
            layout="fill" 
            objectFit="cover" 
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <span className="text-4xl font-bold text-gray-300">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {project.description}
        </p>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {project.tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technology_stacks.map((tech, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Link 
            href={`/projects/${project.uid}`} 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 