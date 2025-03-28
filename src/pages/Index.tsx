
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Camera, Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Index = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 pb-8 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-8 max-w-5xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-studio-light to-studio-primary bg-clip-text text-transparent">
              Record, Analyze, Understand
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Capture your video with real-time emotion and gesture analysis using advanced AI technology.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link to="/record" className="flex-1">
              <Button size="lg" className="w-full gap-2 bg-studio-primary hover:bg-studio-primary/90">
                <Play className="h-4 w-4" />
                Start Recording
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/recordings" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                My Recordings
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-12">
            <div className="bg-card rounded-lg p-6 border border-border/50">
              <div className="h-12 w-12 rounded-full bg-studio-primary/20 flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-studio-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">HD Recording</h3>
              <p className="text-muted-foreground">Capture high-quality video and audio with our advanced recording technology.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border/50">
              <div className="h-12 w-12 rounded-full bg-studio-primary/20 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-studio-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Emotion Analysis</h3>
              <p className="text-muted-foreground">Track facial expressions and emotional responses in real-time with AI.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border/50">
              <div className="h-12 w-12 rounded-full bg-studio-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-studio-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5" />
                </svg>
              </div>
              <h3 className="font-semibold text-xl mb-2">Gesture Detection</h3>
              <p className="text-muted-foreground">Identify body language and physical gestures to enhance your recordings.</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© 2023 VideoMotion Studio. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Index;
