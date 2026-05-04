import type { FenwickNodeProps } from '../components/FenwickNode/FenwickNode.tsx';
import { hierarchy, tree } from 'd3-hierarchy';

interface TreeNode {
  id: number;
  children: TreeNode[];
}

const countBits = (n: number): number => {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
};

// 1. Define an interface for our lines
export interface FenwickEdgeProps {
  id: string;   // Unique ID for React key (e.g., "parent-child")
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const generateTopDownTreeNodes = (
  arraySize: number,
): { nodes: FenwickNodeProps[], edges: FenwickEdgeProps[], svgWidth: number, svgHeight: number } => {
  
  const adjList = new Map<number, number[]>();
  const levelMinDeltaX = new Map<number, number[]>();
  for (let i = 0; i <= arraySize; i++) adjList.set(i, []);

  for (let i = 1; i <= arraySize; i++) {
    const lsb = i & (-i);
    const parent = i - lsb;
    adjList.get(parent)?.push(i);
  }

  const buildHierarchy = (id: number): TreeNode => {
    return {
      id: id,
      children: adjList.get(id)?.map(childId => buildHierarchy(childId)) || []
    };
  };

  const NODE_WIDTH = 60;
  const FIXED_PADDING = 20;
  const X_FOOTPRINT = NODE_WIDTH + FIXED_PADDING;
  const Y_LEVEL_HEIGHT = 80;

  const rootData = buildHierarchy(0);

  const d3TreeLayout = tree<TreeNode>()
    .nodeSize([X_FOOTPRINT, Y_LEVEL_HEIGHT])
    .separation(() => 1);

  const d3Root = hierarchy(rootData);
  const layout = d3TreeLayout(d3Root);
  const descendants = layout.descendants();

  // 1. Calculate raw D3 coordinate boundaries FIRST
  const minRawX = Math.min(...descendants.map(d => d.x));
  const maxRawX = Math.max(...descendants.map(d => d.x));
  const maxRawY = Math.max(...descendants.map(d => d.y));

  const padding = 100; // Extra space around the tree

  // 2. Calculate the exact offset needed to push the leftmost node to 'x = padding'
  // Math.abs(minRawX) turns the most negative x into a positive shift
  const xOffset = Math.abs(minRawX) + padding;
  const yOffset = padding;

  // 3. Apply the dynamic offset to React Nodes
  const reactNodes: FenwickNodeProps[] = descendants.map(d => {
    const i = d.data.id;
    const lsb = i === 0 ? 0 : i & (-i);
    const start = i === 0 ? 0 : i - lsb + 1;
    levelMinDeltaX.set(countBits(i), [...(levelMinDeltaX.get(countBits(i)) || []), d.x]);
    
    return {
      value: 0,
      range: [start, i],
      x: d.x + xOffset, // Pushes everything neatly into the positive viewing area
      y: d.y + yOffset,
      radius: 30,
      index: i,
      isActive: false,
    };
  });

  // 4. Apply the exact same offset to the edges
  const reactEdges: FenwickEdgeProps[] = layout.links().map(link => {
    return {
      id: `${link.source.data.id}-${link.target.data.id}`, 
      x1: link.source.x + xOffset,
      y1: link.source.y + yOffset,
      x2: link.target.x + xOffset,
      y2: link.target.y + yOffset
    };
  });

  // 5. Calculate total SVG required size based on the total spread + padding on both sides
  const requiredSvgWidth = (maxRawX - minRawX) + (padding * 2); 
  const requiredSvgHeight = maxRawY + (padding * 2); 

  return { nodes: reactNodes, edges: reactEdges, svgWidth: requiredSvgWidth, svgHeight: requiredSvgHeight };
};