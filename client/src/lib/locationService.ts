
import { useEffect } from 'react';

const LOCATION_UPDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function useLocationService() {
  useEffect(() => {
    const updateLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch('/api/users/location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ latitude, longitude })
            });
            
            if (!response.ok) {
              console.log('Location update skipped - not time yet');
            }
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        }, (error) => {
          console.error('Error getting location:', error);
        });
      }
    };

    // Update location immediately when component mounts
    updateLocation();

    // Set up periodic updates
    const interval = setInterval(updateLocation, LOCATION_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);
}
