
import React, { useState } from 'react';
import { LocalPlace } from '../types.ts';

interface PlaceCardProps {
  place: LocalPlace;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ' ' + place.address)}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group flex flex-col h-full">
      <div className="aspect-[16/10] w-full overflow-hidden relative bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20 z-10">
          <span className="text-sm font-bold text-gray-900">{place.rating.toFixed(1)}</span>
          <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.3.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.1em]">{place.category}</span>
          <h3 className="text-xl font-bold text-gray-900 leading-tight mt-1">{place.name}</h3>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 italic flex-grow">
          "{place.snippet}"
        </p>
        
        <div className="flex items-start text-xs text-gray-700 mb-5 min-h-[2.5rem]" title={place.address}>
          <svg className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="leading-snug line-clamp-2 font-medium">{place.address}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <a 
            href={place.mapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            <span>Details</span>
          </a>
          <a 
            href={directionsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-7-7 7-7M2 13h15a2 2 0 012 2v2" />
            </svg>
            <span>Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
