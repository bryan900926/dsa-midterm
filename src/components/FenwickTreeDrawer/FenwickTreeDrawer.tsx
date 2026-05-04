import React, { useState } from "react";
import { Settings, X } from "lucide-react";
import "./FenwickTreeDrawer.css";

export interface FenwickTreeDrawerProps {
  buildEventHandler?: (array: number[]) => void;
  updateEventHandler?: (index: number, delta: number) => void;
}

const FenwickTreeDrawer: React.FC<FenwickTreeDrawerProps> = ({ buildEventHandler, updateEventHandler }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [arrayInput, setArrayInput] = useState("1, 2, 3, 4");
  const [updateIndex, setUpdateIndex] = useState("");
  const [updateDelta, setUpdateDelta] = useState("");

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleBuild = () => {
    console.log("Building tree with array:", arrayInput);
    if (buildEventHandler) {
      const parsedArray = arrayInput.split(',').map(n => parseInt(n.trim(), 10));
      buildEventHandler(parsedArray);
    }
    setIsDrawerOpen(false);
  };

  const handleUpdate = () => {
    console.log(`Updating index ${updateIndex} with delta ${updateDelta}`);
    if (updateEventHandler) {
      const idx = parseInt(updateIndex, 10);
      const delta = parseInt(updateDelta, 10);
      updateEventHandler(idx, delta);
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      <button 
        className="sticky-trigger-tab" 
        onClick={toggleDrawer}
        aria-label="Open Settings"
      >
        <Settings size={24} />
      </button>

      {/* Right Drawer Overlay */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={toggleDrawer} />
      )}

      {/* Right Drawer Panel */}
      <div className={`drawer-panel ${isDrawerOpen ? "open" : "closed"}`}>
        
        <div className="drawer-header">
          <h2 className="drawer-title">Tree Controls</h2>
          <button onClick={toggleDrawer} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          
          {/* Row 1: Array Input */}
          <div className="input-group">
            <label className="input-label">Initialize Array</label>
            <input
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              className="text-input"
              placeholder="e.g., 1, 2, 3, 4"
            />
            <button onClick={handleBuild} className="btn btn-primary">
              Build Tree
            </button>
          </div>

          <hr className="divider" />

          {/* Row 2: Point Update */}
          <div className="input-group">
            <label className="input-label">Point Update</label>
            
            <div className="side-by-side">
              <div className="flex-1">
                <label className="sub-label">Index</label>
                <input
                  type="number"
                  value={updateIndex}
                  onChange={(e) => setUpdateIndex(e.target.value)}
                  className="text-input"
                  placeholder="idx"
                />
              </div>
              <div className="flex-1">
                <label className="sub-label">Delta</label>
                <input
                  type="number"
                  value={updateDelta}
                  onChange={(e) => setUpdateDelta(e.target.value)}
                  className="text-input"
                  placeholder="+/- val"
                />
              </div>
            </div>

            <button onClick={handleUpdate} className="btn btn-success">
              Update
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default FenwickTreeDrawer;