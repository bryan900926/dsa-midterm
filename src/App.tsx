import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FenwickNode, { type FenwickNodeProps } from './components/FenwickNode/FenwickNode';
import FenwickHeader from './components/FenwickHeader/FenwickHeader';
import FenwickTreeDrawer from './components/FenwickTreeDrawer/FenwickTreeDrawer';
import { generateTopDownTreeNodes, type FenwickEdgeProps } from './util/generateTopDownNodes';
import { FenwickTree } from './util/FenwickTree';
import { toast, Toaster } from 'react-hot-toast';

import './App.css';
import { AnimationMode, type AnimationModeType } from './util/AnimationMode';

export type QueryStep = { index: number; delta: number };

const App: React.FC = () => {

  // --- Data & UI State ---
  const [arraySize, setArraySize] = useState(16); 
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [nums, setNums] = useState<number[]>(() => new Array(arraySize).fill(0));
  const [initialNums, setInitialNums] = useState<number[]>(() => new Array(arraySize + 1).fill(0));
  const [treeArr, setTreeArr] = useState<number[]>(() => new Array(arraySize + 1).fill(0));
  const [treeData, setNodes] = useState<{ nodes: FenwickNodeProps[], edges: FenwickEdgeProps[], svgWidth: number, svgHeight: number }>(() => generateTopDownTreeNodes(arraySize));

  // --- Unified Animation Engine State ---
  const [mode, setMode] = useState<AnimationModeType>(AnimationMode.IDLE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  // Update State
  const [updatePath, setUpdatePath] = useState<number[]>([]);
  const [deltaValue, setDeltaValue] = useState(0);

  // Query State
  const [queryPath, setQueryPath] = useState<QueryStep[]>([]);
  const [indiceState, setIndiceState] = useState<number[]>([]); // 0 = neutral, 1 = positive (green), -1 = negative (red)
  const [queryResult, setQueryResult] = useState<number>(0);

  const handleStep = (isForward: boolean) => {
    if (mode === AnimationMode.IDLE) return;

    const mul = isForward ? 1 : -1;

    if (mode === AnimationMode.UPDATE) {
      const targetIdx = isForward ? currentStep + 1 : currentStep;

      if (isForward && targetIdx >= updatePath.length) {
        handleSoftReset();
        return;
      }
      if (!isForward && targetIdx < 0) return;

      const treeIdx = updatePath[targetIdx];
      setActiveIndex(treeIdx);
      setTreeArr(prev => {
        const newArr = [...prev];
        newArr[treeIdx] += mul * deltaValue;
        return newArr;
      });

      setCurrentStep(prev => prev + mul);
    } 
    else if (mode === AnimationMode.QUERY) {

      const targetIdx = isForward ? currentStep : currentStep - 1;

      if (isForward && targetIdx >= queryPath.length) {
        handleSoftReset();
        return;
      }
      if (!isForward && targetIdx < 0) return;

      const step = queryPath[targetIdx];
      setQueryResult(prev => prev + (mul * step.delta));

      if (isForward) {
        setIndiceState(prev => {
          const next = [...prev];
          next[step.index] = step.delta >= 0 ? 1 : -1;
          return next;
        });
        setActiveIndex(step.index);
      } else {
        setIndiceState(prev => {
          const next = [...prev];
          next[step.index] = 0;
          return next;
        });
        setActiveIndex(queryPath[targetIdx - 1]?.index ?? null);
      }

    setCurrentStep(prev => prev + mul);
  }
};

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isPlaying) {
      timer = setTimeout(() => {
        handleStep(true);
      }, 800); // Animation speed
    }

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, mode]);


  const handleFlowingUpdate = (startIndex: number, amountToAdd: number) => {
    if (amountToAdd === 0) {
      toast.error("Delta value cannot be zero.");
      return;
    }
    const fenwick = new FenwickTree(arraySize);
    fenwick.build(nums);
    // Update the raw array immediately
    fenwick.update(startIndex, amountToAdd);
    setNums(fenwick.getArray());

    // Queue Animation
    setUpdatePath(fenwick.getUpdateTrace(startIndex, amountToAdd).map(s => s.updatedIndex));
    setDeltaValue(amountToAdd);
    setMode(AnimationMode.UPDATE);
    setCurrentStep(-1);
    setIsPlaying(true);
  };

  const handleFlowingRangeQuery = (startIndex: number, endIndex: number) => {
    if (startIndex < 1 || endIndex < 1 || startIndex > arraySize || endIndex > arraySize) {
      toast.error(`Indices must be between 1 and ${arraySize}.`);
      return;
    }
    if (startIndex > endIndex) {
      toast.error("Start index cannot be greater than end index.");
      return;
    }
    const fenwick = new FenwickTree(arraySize);
    fenwick.build(nums);
    // Reset query visual state
    setIndiceState(new Array(arraySize + 1).fill(0));
    setQueryResult(0);
    
    const pathR: QueryStep[] = fenwick.getQueryTrace(endIndex).map(info => ({ index: info.currentIndex, delta: info.bitValue }));
    const pathL: QueryStep[] = fenwick.getQueryTrace(startIndex - 1).map(info => ({ index: info.currentIndex, delta: -info.bitValue }));

    // Queue Animation
    setQueryPath([...pathR, ...pathL]);
    console.log("Query Path:", [...pathR, ...pathL]);
    setMode(AnimationMode.QUERY);
    setCurrentStep(0);
    setIsPlaying(true);
  };
  // remove all animation state but keep the current tree/array data (for quick consecutive operations)
  const handleSoftReset = () => {
    setIsPlaying(false);
    setMode(AnimationMode.IDLE);
    setActiveIndex(null);
    setIndiceState(new Array(arraySize + 1).fill(0));
  }
  // Reset all data back to old arr
  const handleHardReset = () => {
    setIsPlaying(false);
    setMode(AnimationMode.IDLE);
    setActiveIndex(null);
    setIndiceState(new Array(arraySize + 1).fill(0));
    setCurrentStep(-1);
    const fenwick = new FenwickTree(arraySize);
    fenwick.build(initialNums);
    setTreeArr(fenwick.getTreeArray());
    setNums(initialNums);
  };

  return (
    <div className="main-layout">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#1e293b',
            },
          },
        }} 
      />
      <FenwickTreeDrawer 
        buildEventHandler={(array) => {
          const newTreeData = generateTopDownTreeNodes(array.length);
          setNodes(newTreeData);
          const fenwick = new FenwickTree(array.length);
          fenwick.build(array);
          setTreeArr(fenwick.getTreeArray());
          setArraySize(array.length);
          setNums(array);
          setInitialNums(array);
          handleHardReset();
        }}
        updateEventHandler={(index, delta) => handleFlowingUpdate(index, delta)}
        queryEventHandler={(start, end) => handleFlowingRangeQuery(start, end)}
      />
      <FenwickHeader 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={handleHardReset}
        onForward={() => {
            setIsPlaying(false); // Stop auto-play when manual jumping
            handleStep(true);
          }}
        onBackward={() => {
          setIsPlaying(false); 
          handleStep(false);
        }}
        onRangeQuery={(l, r) => handleFlowingRangeQuery(l, r)}
      />
      <div className="scoreboard-container">
        {mode === AnimationMode.QUERY ? (
          <div className="query-scoreboard">
            <div className="score-label">Running Sum:</div>
            <div className="score-value">{queryResult}</div>
          </div>
        ) : mode === AnimationMode.UPDATE ? (
          <div className="query-scoreboard update-mode">
            <div className="score-label">Updating by:</div>
            <div className="score-value">+{deltaValue}</div>
          </div>
        ) : (
          <div className="query-scoreboard idle-mode">
            Waiting for input...
          </div>
        )}
      </div>
      <div className="tree-section">
        <svg
          width={treeData.svgWidth}
          height={treeData.svgHeight}
          style={{ flexShrink: 0, display: 'block', margin: 'auto' }}
        >
          {treeData.edges.map((edge) => (
            <line key={edge.id} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke="#475569" strokeWidth={2} />
          ))}
          {treeData.nodes.map((node) => {
            const isCurrent = node.index === activeIndex;
            const isPositive = indiceState[node.index] === 1;
            const isNegative = indiceState[node.index] === -1;

            let highlightColor = "transparent";
            if (isPositive && isNegative) highlightColor = "#64748b";
            else if (isPositive) highlightColor = "#22c55e";
            else if (isNegative) highlightColor = "#ef4444";
            else if (isCurrent) highlightColor = "#eab308";

            return (
              <FenwickNode
                key={node.index}
                x={node.x}
                y={node.y}
                radius={node.radius}
                index={node.index}
                value={treeArr[node.index]}
                range={node.range}
                isActive={isCurrent}
                highlightColor={highlightColor}
              />
            );
          })}
        </svg>
      </div>

      <div className="array-section">
        {nums.map((value, idx) => {
          const fenwickIndex = idx + 1;
          const isActivelyHighlighting = fenwickIndex === activeIndex;
          return (
            <div key={`array-cell-${fenwickIndex}`} className="flex-cell">
              <motion.div
                className="flex-box"
                animate={{
                  backgroundColor: isActivelyHighlighting ? '#eab308' : '#1e293b',
                  borderColor: isActivelyHighlighting ? '#fef08a' : '#475569',
                  scale: isActivelyHighlighting ? 1.15 : 1,
                  y: isActivelyHighlighting ? -15 : 0,
                  color: isActivelyHighlighting ? '#1e293b' : '#f8fafc'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
              {value}
              </motion.div>
              <div className="flex-label">[{fenwickIndex}]</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;

