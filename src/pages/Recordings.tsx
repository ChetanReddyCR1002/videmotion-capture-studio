
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Play, Download, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import { toast } from 'sonner';

// Mock data for recordings
const mockRecordings = [
  {
    id: '1',
    title: 'Interview Practice',
    date: '2023-12-15T14:30:00',
    duration: 420, // 7 minutes in seconds
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    title: 'Presentation Rehearsal',
    date: '2023-12-10T10:15:00',
    duration: 840, // 14 minutes in seconds
    thumbnail: 'https://images.unsplash.com/photo-1557425955-df376b5903c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    title: 'Team Meeting',
    date: '2023-12-05T09:00:00',
    duration: 1800, // 30 minutes in seconds
    thumbnail: 'https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

const Recordings = () => {
  const [recordings, setRecordings] = useState(mockRecordings);
  
  // Format duration (seconds to mm:ss or hh:mm:ss)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Delete recording
  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter(recording => recording.id !== id));
    toast('Recording deleted successfully');
  };
  
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-8 px-4">
        <div className="container max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Recordings</h1>
              <p className="text-muted-foreground">Manage and review your recorded videos</p>
            </div>
            
            <Link to="/record">
              <Button className="bg-studio-primary hover:bg-studio-primary/90">
                <Video className="mr-2 h-4 w-4" />
                New Recording
              </Button>
            </Link>
          </div>
          
          {recordings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordings.map(recording => (
                <Card key={recording.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <img 
                      src={recording.thumbnail} 
                      alt={recording.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Play />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(recording.duration)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium truncate mb-1">{recording.title}</h3>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(recording.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(recording.duration)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="flex-1">
                        <Play className="mr-1 h-3 w-3" />
                        Play
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteRecording(recording.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No recordings yet</h3>
              <p className="text-muted-foreground mb-4">Start recording to see your videos here</p>
              <Link to="/record">
                <Button className="bg-studio-primary hover:bg-studio-primary/90">
                  Create New Recording
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default Recordings;
