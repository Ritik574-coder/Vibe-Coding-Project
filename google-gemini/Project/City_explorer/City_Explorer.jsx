import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, Info, Navigation, Map as MapIcon, MessageSquare } from 'lucide-react';

// --- Constants & Defaults ---
const DEFAULT_LOCATION = {
  lat: 40.7128,
  lon: -74.0060,
  display_name: "New York City, New York, USA",
  address: {
    city: "New York",
    country: "USA"
  }
};

const INITIAL_MESSAGE = {
  id: 1,
  sender: 'bot',
  text: "Hello! I'm City Explorer. Mention a city or street address, and I'll take you there on the map!"
};

// --- Helper: Load Leaflet Script & Styles ---
const useLeaflet = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if Leaflet is already available globally and fully loaded
    // We check for 'map' to ensure the library is actually ready to use
    if (typeof window !== 'undefined' && window.L && typeof window.L.map === 'function') {
      setLoaded(true);
      return;
    }

    const scriptId = 'leaflet-script';
    
    // If script is already attached but not fully loaded, poll for it
    if (document.getElementById(scriptId)) {
       const interval = setInterval(() => {
         if (window.L && typeof window.L.map === 'function') {
           setLoaded(true);
           clearInterval(interval);
         }
       }, 200);
       return () => clearInterval(interval);
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      // Double check L availability
      if (window.L && typeof window.L.map === 'function') {
        setLoaded(true);
      }
    };
    script.onerror = () => console.error("Failed to load Leaflet script");
    document.body.appendChild(script);
  }, []);

  return loaded;
};

// --- Component: Map ---
const MapView = ({ location }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const leafletLoaded = useLeaflet();

  // Initialize Map
  useEffect(() => {
    if (leafletLoaded && mapRef.current && !mapInstance.current) {
      // Robust check for Leaflet instance
      if (!window.L || typeof window.L.map !== 'function') return;

      try {
        const L = window.L;
        
        mapInstance.current = L.map(mapRef.current).setView([location.lat, location.lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        markerInstance.current = L.marker([location.lat, location.lon])
          .addTo(mapInstance.current)
          .bindPopup(location.display_name || "Location")
          .openPopup();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    // Cleanup to prevent memory leaks and "map already initialized" errors
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [leafletLoaded]);

  // Update Map on Location Change
  useEffect(() => {
    if (leafletLoaded && mapInstance.current && location) {
       if (!window.L) return;
       const L = window.L;

      try {
        const { lat, lon, display_name } = location;
        
        mapInstance.current.flyTo([lat, lon], 14, { duration: 1.5 });
        
        if (markerInstance.current) {
          markerInstance.current.setLatLng([lat, lon]);
          markerInstance.current.setPopupContent(display_name || "Location").openPopup();
        } else {
           markerInstance.current = L.marker([lat, lon])
            .addTo(mapInstance.current)
            .bindPopup(display_name || "Location")
            .openPopup();
        }
      } catch (error) {
        console.error("Error updating map:", error);
      }
    }
  }, [location, leafletLoaded]);

  return (
    <div className="h-full w-full relative bg-gray-100">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          Loading Map...
        </div>
      )}
      <div ref={mapRef} className="h-full w-full z-0" />
    </div>
  );
};

// --- Component: Chat Bubble ---
const ChatBubble = ({ message }) => {
  const isBot = message.sender === 'bot';
  // Ensure text is a string to prevent "Objects are not valid" error
  const textContent = typeof message.text === 'string' ? message.text : String(message.text);
  
  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
        isBot 
          ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' 
          : 'bg-blue-600 text-white rounded-tr-none'
      }`}>
        <p className="text-sm leading-relaxed">{textContent}</p>
      </div>
    </div>
  );
};

// --- Main Application ---
export default function CityExplorer() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Logic: Simulated AI & Geocoding ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    
    // Add User Message
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    setIsSearching(true);

    try {
      // Fetch from Nominatim (OpenStreetMap Geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userText)}&addressdetails=1&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        
        // Sanitize address: Nominatim sometimes returns [] (empty array) instead of {} for empty address
        // This causes "Objects are not valid as React child" if we try to access properties on []
        const safeAddress = (place.address && !Array.isArray(place.address) && typeof place.address === 'object') 
          ? place.address 
          : {};

        const newLocation = {
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          display_name: place.display_name || "Unknown Location",
          address: safeAddress,
          type: typeof place.type === 'string' ? place.type : '',
          class: place.class
        };

        setCurrentLocation(newLocation);

        // Add Bot Response: Success
        const botMsg = { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `I've found "${place.name || userText}" and updated the map. It's located at ${place.display_name}.` 
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        // Add Bot Response: Not Found
        const botMsg = { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `I couldn't find a specific location matching "${userText}". Try being more specific, like "Eiffel Tower" or "10 Downing Street".` 
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Search failed", error);
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "I'm having trouble connecting to the map services right now. Please try again." 
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- Header --- */}
      <header className="h-16 bg-blue-700 text-white flex items-center justify-between px-6 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <MapIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">City Explorer</h1>
        </div>
        <div className="text-sm opacity-80 hidden md:block">
          Interactive Map & Chat Assistant
        </div>
      </header>

      {/* --- Main Content (3 Columns) --- */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Column 1: Info Box */}
        <div className="w-full md:w-1/4 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg md:shadow-none">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-700">Location Info</h2>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Main Address Card */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Current Selection</h3>
                <p className="text-lg font-medium text-gray-800 leading-snug">
                  {currentLocation.display_name ? currentLocation.display_name.split(',')[0] : 'Unknown'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {currentLocation.display_name || ''}
                </p>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 block">Latitude</span>
                  <span className="font-mono text-sm font-semibold">
                    {typeof currentLocation.lat === 'number' ? currentLocation.lat.toFixed(4) : '0.0000'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 block">Longitude</span>
                  <span className="font-mono text-sm font-semibold">
                    {typeof currentLocation.lon === 'number' ? currentLocation.lon.toFixed(4) : '0.0000'}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Details
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span>Type:</span>
                    <span className="font-medium text-gray-800 capitalize">{currentLocation.type || 'City'}</span>
                  </li>
                  {currentLocation.address && (
                    <>
                      {currentLocation.address.road && (
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                          <span>Street:</span>
                          <span className="font-medium text-gray-800">{currentLocation.address.road}</span>
                        </li>
                      )}
                      {currentLocation.address.city && (
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                          <span>City:</span>
                          <span className="font-medium text-gray-800">{currentLocation.address.city}</span>
                        </li>
                      )}
                      {currentLocation.address.country && (
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                          <span>Country:</span>
                          <span className="font-medium text-gray-800">{currentLocation.address.country}</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Interactive Map */}
        <div className="w-full md:w-2/4 bg-gray-200 relative h-[400px] md:h-auto border-b md:border-b-0 border-gray-300">
          <MapView location={currentLocation} />
          {/* Overlay Label */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md text-xs font-semibold text-gray-700 z-[1000] pointer-events-none">
            Interactive Map
          </div>
        </div>

        {/* Column 3: Chat */}
        <div className="w-full md:w-1/4 bg-white flex flex-col border-l border-gray-200 h-[500px] md:h-auto">
          {/* Chat Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-700">Chat</h2>
            </div>
            <button 
              onClick={handleNewChat}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-medium px-2 py-1 hover:bg-blue-50 rounded"
            >
              <RefreshCw className="w-3 h-3" />
              New Chat
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isSearching && (
              <div className="flex w-full mb-4 justify-start">
                 <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-none px-4 py-2 text-sm italic animate-pulse">
                   Locating...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 shrink-0">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a location (e.g., 'Paris')..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Try: "Times Square", "London Bridge", or specific addresses.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
