
import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full bg-card/80 backdrop-blur-sm border-b border-border/50 fixed top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Video className="h-6 w-6 text-studio-primary" />
          <span className="font-bold text-lg">VideoMotion Studio</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/recordings">
            <Button variant="ghost">My Recordings</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
