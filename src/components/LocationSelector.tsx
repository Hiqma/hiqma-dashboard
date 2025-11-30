'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface LocationData {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [inputMode, setInputMode] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value.address) setSearchQuery(value.address);
    if (value.latitude) setManualLat(value.latitude.toString());
    if (value.longitude) setManualLng(value.longitude.toString());
  }, [value]);

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    try {
      // Use OpenStreetMap Nominatim (free and no CORS issues)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);
  };

  const selectLocation = (result: any) => {
    // OpenStreetMap result
    onChange({
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    });
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    onChange({
      address: `${lat}, ${lng}`,
      latitude: lat,
      longitude: lng
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setInputMode('search')}
          className={`px-3 py-2 text-sm rounded-lg ${
            inputMode === 'search' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 text-black'
          }`}
        >
          Search Address
        </button>
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`px-3 py-2 text-sm rounded-lg ${
            inputMode === 'manual' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 text-black'
          }`}
        >
          Manual Coordinates
        </button>
      </div>

      {inputMode === 'search' ? (
        <div className="space-y-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchQuery && setShowResults(true)}
            placeholder="Search for a location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-black">{result.display_name}</span>
                  </div>
                </button>
              ))
            }
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="e.g., -1.2921"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="e.g., 36.8219"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualCoordinates}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Set Coordinates
          </button>
        </div>
      )}

      {value.latitude && value.longitude && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-black">Selected Location</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-black mb-1">{value.address}</p>
            <p className="text-xs text-gray-600">
              Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </p>
          </div>
          
          {/* Map preview */}
          <div className="mt-3 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${value.longitude-0.01},${value.latitude-0.01},${value.longitude+0.01},${value.latitude+0.01}&layer=mapnik&marker=${value.latitude},${value.longitude}`}
              width="100%"
              height="100%"
              className="rounded-lg"
              title="Location Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}