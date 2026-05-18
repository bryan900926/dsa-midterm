import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  RotateCcw,
} from "lucide-react";

import "./FenwickHeader.css";
import toast from "react-hot-toast";

// Define the expected props
interface FenwickHeaderProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onForward: () => void;
  onBackward: () => void;
  onRangeQuery: (l : number, r: number) => void;
}

const FenwickHeader: React.FC<FenwickHeaderProps> = ({ 
  isPlaying, 
  onTogglePlay, 
  onReset,
  onForward,
  onBackward,
  onRangeQuery
}) => {
  const [l, setL] = useState("1");
  const [r, setR] = useState("5");

  return (
    <header className="fenwick-header">
      {/* Range Query Group */}
      <div className="header-section">
        <div className="query-container">
          <span className="query-label">RANGE SUM</span>
          <input
            type="number"
            value={l}
            onChange={(e) => setL(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="query-input"
          />
          <span className="query-to">to</span>
          <input
            type="number"
            value={r}
            onChange={(e) => setR(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="query-input"
          />
          <button className="icon-btn search-btn" onClick={() => {
            const parsedL = parseInt(l, 10);
            const parsedR = parseInt(r, 10);
            if (Number.isNaN(parsedL) || Number.isNaN(parsedR)) {
              toast.error("invalid range query input");
              return;
            }
            onRangeQuery(parsedL, parsedR);
          }
          }>
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Playback Controls Group */}
      <div className="header-section">
        <div className="controls-container">
          <button className="icon-btn" onClick={onBackward}>
            <SkipBack size={22} fill="currentColor" />
          </button>

          <button
            className={`play-btn ${isPlaying ? "active" : ""}`}
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause size={24} fill="white" />
            ) : (
              <Play size={24} fill="white" />
            )}
          </button>

          <button className="icon-btn" onClick={onForward}>
            <SkipForward size={22} fill="currentColor" />
          </button>
          
          <button className="icon-btn" onClick={onReset} title="Reset Animation">
            <RotateCcw size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default FenwickHeader;