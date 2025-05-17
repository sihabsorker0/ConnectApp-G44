import { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
} from 'lucide-react';
import { formatDuration } from '@/lib/constants';
import { useQueryClient } from "@tanstack/react-query"

interface VideoPlayerProps {
  url: string;
  title?: string;
  userId?: string; // Added userId prop
  videoId?: string; // Add videoId prop
}

export default function VideoPlayer({ url, title, userId, videoId }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [progress, setProgress] = useState({
    played: 0,
    loaded: 0,
    playedSeconds: 0,
    loadedSeconds: 0
  });
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [showingAd, setShowingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [ads, setAds] = useState<any[]>([]);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [countdownTime, setCountdownTime] = useState<number | null>(null);


  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/advertisements');
        const adsData = await response.json();
        setAds(adsData);
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    // Select and show ad when component mounts or URL changes
    const showAd = async () => {
      if (ads && ads.length > 0) {
        // Filter ads by type (pre-roll, mid-roll, post-roll)
        const preRollAds = ads.filter((ad: any) => ad.type === 'pre-roll');
        if (preRollAds.length > 0) {
          const selectedAd = preRollAds[Math.floor(Math.random() * preRollAds.length)];
          console.log('Selected ad:', selectedAd);
          setCurrentAd(selectedAd);
          setShowingAd(true);
          setIsPlaying(true);

          // Track impression
          try {
            await fetch(`/api/advertisements/${selectedAd.id}/impression?userId=${userId}`, { // userId added here
              method: 'POST'
            });
          } catch (error) {
            console.error('Error tracking impression:', error);
          }
        }
      }
    };
    showAd();
  }, [url, ads, userId]); // Reload ads when video URL changes or ads are updated

  // Show mid-roll ads at 50% progress
  const [savedVideoTime, setSavedVideoTime] = useState<number>(0);
  const [midRollShown, setMidRollShown] = useState<boolean>(false);

  useEffect(() => {
    const randomTriggerPoint = Math.random() * 0.8 + 0.1; // Random point between 10% and 90%
    if (progress.played >= randomTriggerPoint && !showingAd && !midRollShown && adProgress < 1) {
      const midRollAds = ads.filter((ad: any) => ad.type === 'mid-roll');
      if (midRollAds.length > 0) {
        setSavedVideoTime(progress.playedSeconds);
        const selectedAd = midRollAds[Math.floor(Math.random() * midRollAds.length)];
        setCurrentAd(selectedAd);
        setShowingAd(true);
        setMidRollShown(true);
        setAdProgress(1);
      }
    }
  }, [progress.played, showingAd, ads, adProgress]);

  const handleAdEnded = async () => {
    if (currentAd) {
      try {
        // Track ad completion
        await fetch(`/api/advertisements/${currentAd.id}/complete`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error tracking ad completion:', error);
      }
    }
    const videoPosition = savedVideoTime;

    setShowingAd(false);
    setCurrentAd(null);
    setAdProgress(0);
    setCountdownTime(null);
    setShowSkipButton(false);

    // Small delay to ensure state updates are complete
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(videoPosition);
        setIsPlaying(true);
      }
    }, 100);
  };

  const handleAdClick = async () => {
    if (currentAd?.targetUrl && currentAd.id) {
      // Track ad click
      try {
        await fetch(`/api/advertisements/${currentAd.id}/click`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error tracking ad click:', error);
      }
      window.open(currentAd.targetUrl, '_blank');
    }
  };

  // Track ad impression when ad starts playing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');

    if (currentAd?.id && videoId && !currentAd.tracked && currentAd.impressionCount !== 1) {
      console.log('Tracking ad impression:', currentAd.id, 'for video:', videoId);
      currentAd.tracked = true;
      currentAd.impressionCount = 1;
      fetch(`/api/advertisements/${currentAd.id}/impression?videoId=${videoId}&userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        // Update both videos and user data
        const queryClient = useQueryClient();
        queryClient.invalidateQueries(['/api/videos']);
        queryClient.invalidateQueries(['/api/user']);
        console.log('Ad impression tracked successfully:', data);
      })
      .catch(error => {
        console.error('Error tracking ad impression:', error);
      });
    }
  }, [currentAd?.id, userId]);


  const handleProgress = (state: any) => {
    setProgress(state);

     // Save progress every 5 seconds
    if (videoId && Math.floor(state.playedSeconds) % 5 === 0) {
      fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          progress: state.playedSeconds
        })
      }).catch(console.error);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!showingAd) {
      playerRef.current?.seekTo(value[0] / 100);
    }
  };

  const formatCurrentTime = () => {
    return formatDuration(Math.floor(progress.playedSeconds));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        if (videoId) {
          const res = await fetch(`/api/videos/${videoId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await res.json();
          if (data.savedProgress && playerRef.current) {
            playerRef.current.seekTo(data.savedProgress);
          }
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    };
    loadSavedProgress();
  }, [videoId]);

  return (
    <div 
      ref={containerRef} 
      className="relative bg-black rounded-xl overflow-hidden shadow-lg group"
      onMouseEnter={() => setIsControlsVisible(true)}
      onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
    >
      {showingAd && currentAd ? (
        <div className="relative">
          <div 
            className="relative w-full h-full cursor-pointer" 
            onClick={handleAdClick}
            style={{ background: 'black' }}
          >
            <ReactPlayer
              url={currentAd.content}
              width="100%"
              height="100%"
              playing={true}
              volume={volume}
              muted={isMuted}
              className="aspect-video"
              onEnded={handleAdEnded}
              onProgress={(state) => {
                if (state.playedSeconds >= 5 && state.playedSeconds < 10) {
                  setCountdownTime(Math.ceil(10 - state.playedSeconds));
                } else if (state.playedSeconds >= 10 && !showSkipButton) {
                  setCountdownTime(null);
                  setShowSkipButton(true);
                }
              }}
              onError={(e) => {
                console.error("Ad player error:", e);
                handleAdEnded();
              }}
            />
            <div className="absolute inset-0 bg-transparent" />
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
            {countdownTime ? (
              <div className="bg-black/80 text-white px-4 py-2 rounded">
                {countdownTime}s
              </div>
            ) : showSkipButton && (
              <Button
                className="bg-black/80 text-white hover:bg-black"
                onClick={handleAdEnded}
              >
                Skip Ad
              </Button>
            )}
          </div>
          <div 
            className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 text-sm rounded"
          >
            Ad
          </div>
        </div>
      ) : (
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          className="aspect-video"
          onProgress={handleProgress}
          onDuration={setDuration}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={() => setIsPlaying(!isPlaying)}
          onError={(e) => {
            console.error("Video player error:", e);
            setError("Failed to load video");
            setIsPlaying(false);
          }}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 p-4">
          <div className="text-white text-center">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setError(null);
                playerRef.current?.seekTo(0);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Slider
          value={[progress.played * 100]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="video-progress h-1.5 hover:h-2.5 transition-all"
        />

        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="relative" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20" 
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              {showVolumeSlider && (
                <div className="absolute bottom-full left-2 mb-2 w-24 p-2 bg-black/80 rounded">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setVolume(value[0] / 100);
                      if (value[0] > 0) setIsMuted(false);
                    }}
                  />
                </div>
              )}
            </div>

            <span className="text-white text-sm">
              {formatCurrentTime()} / {formatDuration(Math.floor(duration))}
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}