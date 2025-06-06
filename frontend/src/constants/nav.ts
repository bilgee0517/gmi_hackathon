export interface SidebarLink {
    name: string;
    href: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  }
  
  import { HomeIcon, FolderIcon, PlusCircleIcon, CodeBracketIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
  
  export const sidebarLinks: SidebarLink[] = [
    { name: 'Dashboard',     href: '/dashboard',      icon: HomeIcon },
    { name: 'Projects',      href: '/projects',       icon: FolderIcon },
    { name: 'New Project',   href: '/projects/new',   icon: PlusCircleIcon },
    { name: 'IDE',           href: '/ide',            icon: CodeBracketIcon },
    { name: 'AI IDE',        href: '/ide/enhanced',   icon: ChatBubbleLeftRightIcon },
  ];