import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';

// Google Maps API key
const API_KEY = 'AIzaSyDfoscEj2ZA3OK_EyZ3timZNg3owNodbYw'; 

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 47.444,
  lng: -122.176
};

const MAX_RETRIES = 50;

export function MapContainer(props) {
    const [stops, setStops] = useState(['']);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState('');
    const [workHours, setWorkHours] = useState('');
    const [retry, setRetry] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isValid, setIsValid] = useState(false);
  
    const addStop = () => {
      setStops([...stops, '']);
    };

    const handleStopChange = (value, index) => {
        const newStops = [...stops];
        newStops[index] = value;
        setStops(newStops);
    };

    const inputStop = (value, index) => {
        setIsValid(validateLatLon(value));
        if  (!isValid) {
            toast.error(`Stop #${index + 1} coordinate format is invalid`);
            return;
        }
        const newStops = [...stops];
        newStops[index] = value;
        setStops(newStops);
    };
  
    const removeStop = (index) => {
      const newStops = [...stops];
      newStops.splice(index, 1);
      setStops(newStops);
    };

    const validateLatLon = (value) => {
        const regex = /^-?([1-8]?[0-9](\.\d+)?|90(\.0+)?),\s*-?(180(\.0+)?|((1[0-7][0-9])|([1-9]?[0-9]))(\.\d+)?)$/;
        return regex.test(value);
    };
  
    const calculateRoute = () => {
      if (stops.length <= 1) {
        toast.error(`Please add destination coordinate`);
        return;
      }
      // validate coordinates format
      const stop = stops.find((stop) => stop === '' || !validateLatLon(stop));
      if (stops.indexOf(stop) >= 0) {
        toast.error(`Stop #${stops.indexOf(stop) + 1} coordinate format is invalid`);
        return;
      }

      const waypoints = stops.filter(stop => stop.trim()).map(stop => ({
        location: stop,
        stopover: true
      }));
      const origin = waypoints.shift().location;
      const destinationLocation = stops[stops.length - 1].trim();
  
      if (origin && destinationLocation) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: origin,
            destination: destinationLocation,
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            ...(retry && { avoidTolls: true, avoidFerries: true })
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              // Google maps api is supported to return the directions distances
              const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
              setDistance((totalDistance / 1000).toFixed(2));
              // The average speed of driving is 50 km/h. No need to consider the stop time.
              setWorkHours(parseFloat((distance / 50)).toFixed(2));
              // The driver works only 8 hours a day.
              if (workHours > 8) {
                if (retryCount >= MAX_RETRIES) {
                    toast.error(`dispatch route work hours is more than 8 hours`);
                    return;
                }

                setRetry(true);
                setRetryCount(prevCount =>  prevCount + 1);
                calculateRoute();
              } else {
                setDirections(result);
                setRetry(false); 
                setRetryCount(0);
              }
            } else {
              toast.error(`error fetching directions ${result.status}`);
              const base = "https://www.google.com/maps/dir/";
              const stopParameters = stops.filter((stop) => stop.trim() !== '').map((stop) => encodeURIComponent(stop)).join('/');
              const destinationParameter = encodeURIComponent(destinationLocation);
              window.open(`${base}${stopParameters}/${destinationParameter}`, '__blank');
            }
          }
        );
      }
    };

  return (
    <div className="relative h-screen">
        <div className="absolute top-28 left-2.5 bg-white p-4 shadow-lg rounded h-4/5 w-1/4 z-20" >
            <div className="mb-2 pb-2 border-dashed text-blue-400 border-b-2 border-blue-400 w-full">
                <p className="font-bold" style={{fontSize: '28px'}}>Dynamic Routing and Scheduling App</p>
            </div>
            <div>
                {stops.map((stop, index) => (
                    <div key={`stop-${index}`}>
                        <span className="text-base font-medium text-gray-500">{index === 0 ? 'Starting Point' : ((index !== stops.length - 1) ? `Stop #${index + 1}` : `Destination`)}</span>
                        <div className="px-4 py-2 rounded flex items-center space-x-2 w-full">
                            <input
                                className="mb-2 appearance-none border-2 border-gray-200 rounded w-2/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 transition-colors"
                                type="text"
                                placeholder={`Stop #${index + 1} Name`}
                            />
                            <input
                                className="mb-2 appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 transition-colors"
                                type="text"
                                placeholder="Latitude,Longitude"
                                value={stop.latitude}
                                onChange={(e) =>
                                    handleStopChange(e.target.value.trim(), index)
                                }
                                onBlur={(e) =>
                                    inputStop(e.target.value.trim(), index)
                                }
                            />
                            {stops.length > 1 && (
                                <button className="px-4 py-2 rounded flex items-center space-x-2" title="Remove this destination" onClick={() => removeStop(index)}> 
                                    <Icon className="align-middle w-6 h-6" icon="solar:close-circle-bold" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button className="px-4 py-2 rounded flex items-center space-x-2" onClick={addStop}> 
                    <Icon className="align-middle w-8 h-8" icon="solar:add-circle-bold" />
                    <p className="text-base font-medium text-gray-500">Add destination</p>
                </button>
            </div>

            <button 
             className="bg-blue-400 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded focus:outline-none shadow-lg transition-colors"
             onClick={calculateRoute}>
                Dispatch Route
            </button>
            <ToastContainer />     
        </div>

        <LoadScript googleMapsApiKey={API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
            >
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
       </LoadScript>
    </div>
  );
}

export default MapContainer;