import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ keyword, handleKeyPress, setKeyword, fetchMusicData }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-music-note-list mx-2"></i>Spotify Like
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="d-flex w-100 justify-content-center">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={handleKeyPress}
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button
                onClick={() => {
                  fetchMusicData();
                }}
                className="btn btn-outline-success"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
