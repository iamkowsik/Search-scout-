
import React, { useState, useEffect, useMemo } from 'react';
import { findNearbyPlaces } from './services/geminiService.ts';
import { LocalPlace, SearchResponse, UserLocation } from './types.ts';
import PlaceCard from './components/PlaceCard.tsx';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setError("Location access is required to find places near you.");
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setMinRating(0); 
    setSelectedCategory('All');

    try {
      const data = await findNearbyPlaces(query, location);
      setResults(data);
    } catch (err) {
      setError("Search failed. Please try a different category.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = useMemo(() => {
    if (!results) return [];
    const cats = results.places.map(p => p.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [results]);

  const filteredPlaces = useMemo(() => {
    if (!results) return [];
    return results.places.filter(place => {
      const matchesRating = place.rating >= minRating;
      const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
      return matchesRating && matchesCategory;
    });
  }, [results, minRating, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-50 text-blue-600 text-xs font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Search Scout
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Find Anything Nearby
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
            Discover real local establishments with accurate city names and ratings.
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <div className="flex bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden p-1.5 focus-within:border-blue-500 transition-all">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Saloon, Restaurant, Mall..." 
                className="flex-1 px-6 py-4 bg-white text-black text-lg font-medium outline-none placeholder:text-gray-400"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white font-bold px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Search</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Saloon', 'Restaurant', 'Shopping Mall', 'Pharmacy', 'Gym'].map(tag => (
              <button 
                key={tag}
                onClick={() => setQuery(tag)}
                className={`px-4 py-2 border rounded-full text-xs font-bold transition-all shadow-sm ${
                  query === tag ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-12 flex items-center font-medium">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-[16/10] bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded mb-4"></div>
                <div className="h-12 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between sticky top-4 z-40 backdrop-blur-sm bg-white/95">
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Filter</span>
                <div className="flex gap-2">
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Rating</span>
                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl w-full md:w-auto">
                  {[0, 4.0, 4.5, 4.8].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        minRating === rating 
                          ? 'bg-white shadow-sm text-black' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div>
              <div className="flex items-end justify-between mb-8 px-2">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Search Results</h3>
                  <p className="text-gray-500 mt-2 font-medium">
                    Found {filteredPlaces.length} real establishments near you.
                  </p>
                </div>
                { (minRating > 0 || selectedCategory !== 'All') && (
                  <button 
                    onClick={() => { setMinRating(0); setSelectedCategory('All'); }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              {filteredPlaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPlaces.map((place, idx) => (
                    <PlaceCard key={idx} place={place} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900">No matches found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting filters for better results.</p>
                </div>
              )}
            </div>

            {/* Citations */}
            {results.groundingLinks.length > 0 && (
              <div className="pt-12 border-t border-gray-200">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Verified Data Sources</h4>
                <div className="flex flex-wrap gap-3 px-2">
                  {results.groundingLinks.map((link, i) => (
                    <a 
                      key={i}
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !results && (
          <div className="text-center py-32">
            <div className="text-9xl mb-8 grayscale opacity-10 select-none">📍</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Ready to explore?</h2>
            <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
              Find the highest-rated services in your immediate area with verified addresses.
            </p>
          </div>
        )}
      </main>

      {/* Main Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between w-full gap-12 mb-12 border-b border-gray-50 pb-12">
            <div className="max-w-xs">
              <div className="text-xl font-black text-gray-900 mb-4 tracking-tight uppercase">Search Scout</div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Empowering your local search with the intelligence of Gemini AI. Discovering gems in your neighborhood has never been easier.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Explore</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><button onClick={() => setQuery('Saloon')} className="hover:text-blue-600 transition-colors">Saloons</button></li>
                  <li><button onClick={() => setQuery('Restaurant')} className="hover:text-blue-600 transition-colors">Restaurants</button></li>
                  <li><button onClick={() => setQuery('Shopping Mall')} className="hover:text-blue-600 transition-colors">Malls</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Connect</h4>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://www.instagram.com/iam_kowsik_/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                    title="Instagram @iam_kowsik_"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href="mailto:marimanokowsik2004@gmail.com" 
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Email marimanokowsik2004@gmail.com"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l12-9.725v15.438h-24v-15.438l12 9.725z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center w-full">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} Search Scout. Crafted with passion. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Navigation Footer */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-5 z-50 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap">Search Scout</span>
          <div className="w-px h-3 bg-white/20"></div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[10px] font-black hover:text-blue-400 transition-colors uppercase tracking-[0.1em] whitespace-nowrap"
          >
            New Search
          </button>
        </div>
        
        <div className="w-px h-3 bg-white/20"></div>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://www.instagram.com/iam_kowsik_/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white/70 hover:text-pink-500 transition-all transform hover:scale-110"
            title="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a 
            href="mailto:marimanokowsik2004@gmail.com" 
            className="text-white/70 hover:text-red-500 transition-all transform hover:scale-110"
            title="Email"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l12-9.725v15.438h-24v-15.438l12 9.725z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
