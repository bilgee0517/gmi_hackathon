export interface SidebarLink {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

import { 
  HomeIcon, 
  FolderIcon, 
  PlusCircleIcon, 
  CodeBracketIcon, 
  SparklesIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export const sidebarLinks: SidebarLink[] = [
  { name: 'Dashboard',     href: '/dashboard',      icon: HomeIcon },
  { name: 'Projects',      href: '/projects',       icon: FolderIcon },
  { name: 'Code Editor',   href: '/code',           icon: CodeBracketIcon },
  { name: 'IDE',           href: '/ide',            icon: PlayIcon },
  { name: 'AI IDE',        href: '/ide/enhanced',   icon: SparklesIcon },
];