import type { FenwickNodeProps } from '../components/FenwickNode/FenwickNode.tsx';
import { hierarchy} from 'd3-hierarchy';

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

export interface FenwickEdgeProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const generateTopDownTreeNodes = (
  arraySize: number,
): {
  nodes: FenwickNodeProps[],
  edges: FenwickEdgeProps[],
  svgWidth: number,
  svgHeight: number
} => {

  const adjList = new Map<number, number[]>();
  const levelMinDeltaX = new Map<number, number[]>();
  adjList.set(0, []); // Root node with id 0

  for (let i = 1; i <= arraySize; i++) {
    const lsb = i & (-i);
    const parent = i - lsb;
    adjList.set(i, []);
    adjList.get(parent)?.push(i);
  }

  const buildHierarchy = (id: number): TreeNode => {
    return {
      id: id,
      children: adjList.get(id)?.map(childId => buildHierarchy(childId)) || []
    };
  };

  const rootData = buildHierarchy(0);

  const NODE_WIDTH = 80;
  const FIXED_PADDING = 40;
  const X_FOOTPRINT = NODE_WIDTH + FIXED_PADDING;
  const Y_LEVEL_HEIGHT = 100;


  const root = hierarchy<TreeNode>(rootData);


  root.each(node => {
    const nodeId = node.data.id; 

    node.x = nodeId * X_FOOTPRINT;

    node.y = node.depth * Y_LEVEL_HEIGHT;
  });

  const links = root.links();
  const descendants = root.descendants();

  const minRawX = Math.min(...descendants.map(d => d.x ?? 0));
  const maxRawX = Math.max(...descendants.map(d => d.x ?? 0));
  const maxRawY = Math.max(...descendants.map(d => d.y ?? 0));

  const padding = 100; // Extra space around the tree

  const xOffset = Math.abs(minRawX) + padding;
  const yOffset = padding;

  const reactNodes: FenwickNodeProps[] = descendants.map(d => {
    const i = d.data.id;
    const lsb = i === 0 ? 0 : i & (-i);
    const start = i === 0 ? 0 : i - lsb + 1;
    levelMinDeltaX.set(countBits(i), [...(levelMinDeltaX.get(countBits(i)) || []), d.x ?? 0]);
    
    return {
      value: 0,
      range: [start, i],
      x: (d.x ?? 0) + xOffset,
      y: (d.y ?? 0) + yOffset,
      radius: 40,
      index: i,
      isActive: false,
    };
  });

  const reactEdges: FenwickEdgeProps[] = links.map(link => {
    return {
      id: `${link.source.data.id}-${link.target.data.id}`, 
      x1: (link.source.x ?? 0) + xOffset,
      y1: (link.source.y ?? 0) + yOffset,
      x2: (link.target.x ?? 0) + xOffset,
      y2: (link.target.y ?? 0) + yOffset
    };
  });

  const requiredSvgWidth = (maxRawX - minRawX) + (padding * 2); 
  const requiredSvgHeight = maxRawY + (padding * 2); 

  return { nodes: reactNodes, edges: reactEdges, svgWidth: requiredSvgWidth, svgHeight: requiredSvgHeight };
};