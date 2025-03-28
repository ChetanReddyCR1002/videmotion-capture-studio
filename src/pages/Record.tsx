
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MicOff, Mic, Video, VideoOff, StopCircle, Download, Gauge, Smile, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  // Simulated analysis data
  const [emotions, setEmotions] = useState({ happy: 0.1, neutral: 0.7, surprised: 0.1, sad: 0.1 });
  const [eyeMovement, setEyeMovement] = useState({ focused: 0.8, distracted: 0.2 });
  const [gestures, setGestures] = useState({ none: 0.9, handRaise: 0.1 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera access denied",
          description: "Please allow camera and microphone access to use this feature.",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    
    initCamera();
    
    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate]);
  
  // Start recording
  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
    
    // Start recording and timer
    mediaRecorder.start();
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
      
      // Simulated analysis updates every 5 seconds
      if (recordingTime % 5 === 0) {
        updateSimulatedAnalysis();
      }
    }, 1000);
    
    toast({
      title: "Recording started",
      description: "Your video is now being recorded."
    });
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording complete",
        description: "Your video has been recorded and is ready for download."
      });
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };
  
  // Download recorded video
  const downloadVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };
  
  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Simulated analysis updates
  const updateSimulatedAnalysis = () => {
    // Generate random values for simulated analysis
    setEmotions({
      happy: Math.random() * 0.4,
      neutral: Math.random() * 0.4 + 0.5, // Bias toward neutral
      surprised: Math.random() * 0.2,
      sad: Math.random() * 0.2
    });
    
    setEyeMovement({
      focused: Math.random() * 0.3 + 0.6, // Bias toward focused
      distracted: Math.random() * 0.3
    });
    
    setGestures({
      none: Math.random() * 0.2 + 0.7, // Bias toward none
      handRaise: Math.random() * 0.2
    });
  };
  
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-8 px-4">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main video area */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
                <div className="relative w-full aspect-video bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted={isMuted} 
                    className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                  />
                  
                  {!isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card">
                      <div className="flex flex-col items-center">
                        <VideoOff size={48} className="text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Camera is off</p>
                      </div>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive animate-pulse-recording" />
                      <span className="text-sm font-medium text-white">REC {formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>
                
                {/* Recording controls */}
                <div className="flex items-center justify-center gap-4 p-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={toggleMute}
                    className={isMuted ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive' : ''}
                  >
                    {isMuted ? <MicOff /> : <Mic />}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={toggleVideo}
                    className={!isVideoOn ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive' : ''}
                  >
                    {!isVideoOn ? <VideoOff /> : <Video />}
                  </Button>
                  
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording} 
                      className="bg-studio-primary hover:bg-studio-primary/90"
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopRecording} 
                      variant="destructive"
                    >
                      <StopCircle className="mr-2 h-4 w-4" />
                      End Recording
                    </Button>
                  )}
                  
                  {recordedBlob && (
                    <Button 
                      onClick={downloadVideo} 
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </Card>
              
              {!isRecording && recordedBlob && (
                <Card className="p-4 space-y-4">
                  <h3 className="font-medium">Recording Complete</h3>
                  <p className="text-sm text-muted-foreground">Your recording is ready. You can download it or start a new recording.</p>
                  <div className="flex gap-2">
                    <Button onClick={downloadVideo} className="bg-studio-primary hover:bg-studio-primary/90">
                      <Download className="mr-2 h-4 w-4" />
                      Download Recording
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setRecordedBlob(null);
                        setRecordingTime(0);
                      }}
                    >
                      New Recording
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Analysis panel */}
            <div className="space-y-4">
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-studio-primary" />
                  <h3 className="font-medium">Real-time Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Smile className="h-4 w-4 text-studio-light" />
                      <h4 className="text-sm font-medium">Emotions</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Happy</span>
                        <Progress value={emotions.happy * 100} className="h-2" />
                        
                        <span className="text-muted-foreground">Neutral</span>
                        <Progress value={emotions.neutral * 100} className="h-2" />
                        
                        <span className="text-muted-foreground">Surprised</span>
                        <Progress value={emotions.surprised * 100} className="h-2" />
                        
                        <span className="text-muted-foreground">Sad</span>
                        <Progress value={emotions.sad * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-studio-light" />
                      <h4 className="text-sm font-medium">Eye Movement</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Focused</span>
                        <Progress value={eyeMovement.focused * 100} className="h-2" />
                        
                        <span className="text-muted-foreground">Distracted</span>
                        <Progress value={eyeMovement.distracted * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-studio-light" />
                      <h4 className="text-sm font-medium">Gestures</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <span className="text-muted-foreground">None</span>
                        <Progress value={gestures.none * 100} className="h-2" />
                        
                        <span className="text-muted-foreground">Hand Raise</span>
                        <Progress value={gestures.handRaise * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <p>* Analysis is simulated in this demo</p>
                </div>
              </Card>
              
              <Card className="p-4 space-y-4">
                <h3 className="font-medium">Recording Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="text-studio-primary">•</span>
                    Ensure good lighting for better video quality
                  </li>
                  <li className="flex gap-2">
                    <span className="text-studio-primary">•</span>
                    Speak clearly for better audio capture
                  </li>
                  <li className="flex gap-2">
                    <span className="text-studio-primary">•</span>
                    Position yourself centrally in the frame
                  </li>
                  <li className="flex gap-2">
                    <span className="text-studio-primary">•</span>
                    Use a neutral background for professional recordings
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Record;
