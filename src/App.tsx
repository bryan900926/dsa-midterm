import React, { useState } from 'react';
import type { FenwickNodeProps } from './components/FenwickNode/FenwickNode';
import {motion} from 'framer-motion';
import FenwickNode from './components/FenwickNode/FenwickNode';
import FenwickTreeDrawer from './components/FenwickTreeDrawer/FenwickTreeDrawer.tsx';
import { generateTopDownTreeNodes, type FenwickEdgeProps } from './util/generateTopDownNodes';
import './App.css';

const App: React.FC = () => {
  const arraySize = 50;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [treeArr, setTreeArr] = useState<number[]>(() => {
    return new Array(arraySize + 1).fill(0); // + 1 for dummy 0 index
  });
  const [treeData, setNodes] = useState<{ nodes: FenwickNodeProps[], edges: FenwickEdgeProps[], svgWidth: number, svgHeight: number }>(() => {
    return generateTopDownTreeNodes(arraySize);
  });

  const handleFlowingUpdate = (startIndex: number, amountToAdd: number) => {
    let currentIndex = startIndex;
    const flowSteps: number[] = [];

    while (currentIndex <= arraySize) {
      flowSteps.push(currentIndex);
      currentIndex += currentIndex & (-currentIndex); // The Fenwick LSB jump!
    }

    flowSteps.forEach((stepIndex, i) => {
      setTimeout(() => {
        setActiveIndex(stepIndex);
        setTreeArr(prevArray => {
          const newArray = [...prevArray];
          newArray[stepIndex] += amountToAdd;
          return newArray;
        });

      }, i * 600);
    });
    setTimeout(() => {
      setActiveIndex(null);
    }, flowSteps.length * 600);
  };

 return (
    <div className="main-layout">
      <FenwickTreeDrawer 
        buildEventHandler={(array) => {
          const newTreeData = generateTopDownTreeNodes(array.length);
          setNodes(newTreeData);
          setTreeArr([0, ...array]); // Reset tree array with new values
        }}
        updateEventHandler={(index, delta) => {
          handleFlowingUpdate(index, delta);
        }}
      />
      <div className="tree-section">
        <svg
          width={treeData.svgWidth}
          height={treeData.svgHeight}
          style={{ 
            flexShrink: 0, 
            display: 'block',
            margin: 'auto' // Failsafe to perfectly center it if it is smaller than the screen
          }}
        >
          {treeData.edges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke="#475569"
              strokeWidth={2}
            />
          ))}
      {treeData.nodes.map((node) => {
        const isActivelyHighlighting = node.index === activeIndex;
        return (
          <FenwickNode
            key={node.index}
            x={node.x}
            y={node.y}
            radius={node.radius}
            index={node.index}
            value={treeArr[node.index]}
            range={node.range}
            isActive={isActivelyHighlighting} // Pass the boolean trigger!
          />
        );
      })}
        </svg>
      </div>
    <div className="array-section">
      {treeArr.slice(1).map((value, idx) => {
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
 )
};

export default App;
