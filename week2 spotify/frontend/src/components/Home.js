import { useContext, useEffect, useState, useRef } from 'react';
import Navbar from './Navbar';
import { MusicContext } from '../Context';
import './Home.css';

function Home() {
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [tracks, setTracks] = useState([]);  
  const [popularSongs, setPopularSongs] = useState([]);
  const [popularPodcasts, setPopularPodcasts] = useState([]);
  const [token, setToken] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSearchView, setIsSearchView] = useState(false); // Toggle between home and search views
  const [likedTracks, setLikedTracks] = useState([]); // Store liked tracks
  const [isLikedSongsView, setIsLikedSongsView] = useState(false); // View for liked songs
  const audioRef = useRef(new Audio());

  const { isLoading, setIsLoading } = useContext(MusicContext);

  const fetchPopularSongs = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/browse/new-releases?country=US`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch popular songs: ${response.statusText}`);
      }

      const jsonData = await response.json();
      setPopularSongs(jsonData.albums.items.slice(0, 10)); // Fetch top 10 songs
    } catch (error) {
      console.error('Error fetching popular songs:', error);
    }
  };

  const fetchPopularPodcasts = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/browse/categories/podcasts/playlists?country=US`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch podcasts: ${response.statusText}`);
      }

      const jsonData = await response.json();
      setPopularPodcasts(jsonData.playlists.items.slice(0, 10)); // Fetch top 10 podcasts
    } catch (error) {
      console.error('Error fetching popular podcasts:', error);
    }
  };

  const fetchMusicData = async (query = '', offset = 0) => {
    if (!token) return;

    setTracks([]);
    setMessage('');
    window.scrollTo(0, 0);
    setIsLoading(true);

    try {
      const searchQuery = query || keyword;
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch music data: ${response.statusText}`);
      }

      const jsonData = await response.json();
      setTracks(jsonData.tracks.items.slice(0, 10));
      setHasSearched(true);
      setIsSearchView(true); // After search, switch to the search view
    } catch (error) {
      setMessage('We couldn’t retrieve the music data. Please try again.');
      console.error('Error fetching music data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials&client_id=f9cb129b7344433382bc189c009fcb2d&client_secret=53a9708e11014d9a80dba499980c3735',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setToken(jsonData.access_token);
      } catch (error) {
        setMessage('We couldn’t retrieve the token. Please try again.');
        console.error('Error fetching token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [setIsLoading]);

  useEffect(() => {
    if (token) {
      fetchPopularSongs();
      fetchPopularPodcasts();
    }
  }, [token]);

  const playSong = (track) => {
    if (currentTrack && currentTrack.id === track.id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = track.preview_url || '';
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const toggleLike = (trackId) => {
    setLikedTracks((prevLikedTracks) =>
      prevLikedTracks.includes(trackId)
        ? prevLikedTracks.filter((id) => id !== trackId)
        : [...prevLikedTracks, trackId]
    );
  };

  const removeFromPlaylist = (trackId) => {
    setLikedTracks((prevLikedTracks) =>
      prevLikedTracks.filter((id) => id !== trackId)
    );
  };

  useEffect(() => {
    return () => {
      audioRef.current.pause();
    };
  }, []);

  return (
    <>
      <Navbar
        keyword={keyword}
        setKeyword={setKeyword}
        handleKeyPress={(e) => e.key === 'Enter' && fetchMusicData(keyword)}
        fetchMusicData={() => fetchMusicData(keyword)}
      />

      <div className="container">
        {/* Toggle views between Home and Search */}
        <button
          onClick={() => setIsSearchView(false)} // Back to Home
          className={`btn btn-outline-secondary mb-3 ${!isSearchView ? 'd-none' : ''}`}
        >
          Back to Home
        </button>

        {/* Liked Songs Playlist Card */}
        {!isSearchView && !isLikedSongsView && (
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card" onClick={() => setIsLikedSongsView(true)}>
                <div className="card-body text-center">
                  <h5 className="card-title">Liked Songs Playlist</h5>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liked Songs Playlist View */}
        {isLikedSongsView && (
          <>
            <button
              onClick={() => setIsLikedSongsView(false)} // Back to Home
              className="btn btn-outline-secondary mb-3"
            >
              Back to Home
            </button>

            <h2 className="section-title">Liked Songs</h2>
            <div className="row">
              {likedTracks.length > 0 ? (
                likedTracks.map((trackId) => {
                  const track = tracks.find((t) => t.id === trackId);
                  return (
                    track && (
                      <div key={track.id} className="col-md-3 mb-4">
                        <div className="card">
                          <img
                            src={track.album.images[0]?.url}
                            className="card-img-top"
                            alt={track.name}
                          />
                          <div className="card-body">
                            <h5 className="card-title">{track.name}</h5>
                            <p className="card-text">
                              {track.artists.map((artist) => artist.name).join(', ')}
                            </p>
                            <button
                              onClick={() => removeFromPlaylist(track.id)}
                              className="btn btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  );
                })
              ) : (
                <div className="col-12 text-center">
                  <p>No songs in the liked playlist yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Home view (Popular Songs and Podcasts) */}
        {!isSearchView && !isLikedSongsView && (
          <>
            <h2 className="section-title">Popular Songs of the Year</h2>
            <div className="row">
              {popularSongs.map((song) => (
                <div key={song.id} className="col-md-3 mb-4">
                  <div className="card">
                    <img
                      src={song.images[0]?.url}
                      className="card-img-top"
                      alt={song.name}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{song.name}</h5>
                      <p className="card-text">{song.artists.map((artist) => artist.name).join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="section-title">Popular Podcasts</h2>
            <div className="row">
              {popularPodcasts.map((podcast) => (
                <div key={podcast.id} className="col-md-3 mb-4">
                  <div className="card">
                    <img
                      src={podcast.images[0]?.url}
                      className="card-img-top"
                      alt={podcast.name}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{podcast.name}</h5>
                      <p className="card-text">{podcast.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search Results View */}
        {isSearchView && (
          <>
            <h2 className="section-title">Search Results</h2>
            <div className="row">
              {tracks.length > 0 ? (
                tracks.map((track) => (
                  <div key={track.id} className="col-md-3 mb-4">
                    <div className="card">
                      <img
                        src={track.album.images[0]?.url}
                        className="card-img-top"
                        alt={track.name}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{track.name}</h5>
                        <p className="card-text">
                          {track.artists.map((artist) => artist.name).join(', ')}
                        </p>
                        <button
                          onClick={() => playSong(track)}
                          className="btn btn-primary"
                        >
                          {currentTrack && currentTrack.id === track.id && isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <button
                          onClick={() => toggleLike(track.id)}
                          className={`btn ${likedTracks.includes(track.id) ? 'btn-danger' : 'btn-outline-secondary'}`}
                        >
                          <span className={`like-icon ${likedTracks.includes(track.id) ? 'liked' : ''}`}>&#10084;&#65039;</span> Like
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No search results to display.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Home;
