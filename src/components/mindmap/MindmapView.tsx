import React, { useEffect, useRef, useState, useCallback, MouseEvent } from 'react';
import { Box, Button, Paper } from '@mui/material';
import { useMindMap } from '../../context/MindMapContext';
import { MindmapNode } from '../../types/mindmap';
import { MindmapToolbar } from './MindmapToolbar';

interface MindmapViewProps {
  data: MindmapNode;
  onSave?: (data: MindmapNode) => void;
  readOnly?: boolean;
  width?: number;
  height?: number;
  isEditMode?: boolean;
}

interface NodeType {
  id: string;
  text: string;
  x: number;
  y: number;
  style?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    x?: number;
    y?: number;
  };
}

interface ConnectionType {
  source: string;
  target: string;
  points?: { x: number; y: number }[];
}

export const MindmapView: React.FC<MindmapViewProps> = ({
  data,
  onSave,
  readOnly = false,
  width = 800,
  height = 600,
  isEditMode = false,
}) => {
  const {
    nodes,
    connections,
    selectedNodes,
    editingNodeId,
    setNodes,
    setConnections,
    updateConnection,
    updateNode,
    addConnection,
    toggleSelectNode,
    startEditing,
    stopEditing,
    deleteSelectedNodes,
    setSelectedNodes,
  } = useMindMap();

  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const draggedNode = useRef<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodesToMove = useRef<{ id: string; initialX: number; initialY: number }[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const initialDragPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetMindmapState = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setIsPanning(false);
    setSelectedNodes([]);
    draggedNode.current = null;
    dragOffset.current = { x: 0, y: 0 };
    nodesToMove.current = [];
    lastMousePos.current = { x: 0, y: 0 };
    initialDragPos.current = { x: 0, y: 0 };
    hasMoved.current = false;
  }, [setSelectedNodes]);

  useEffect(() => {
    resetMindmapState();
  }, [data, resetMindmapState]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1000); // 1 second delay
  }, []);

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            x,
            y,
            style: {
              ...node.style,
              x,
              y,
            }
          };
        }
        return node;
      });
      return updatedNodes;
    });
    debouncedSave();
  }, [debouncedSave]);

  const updateNodeText = useCallback((nodeId: string, text: string) => {
    updateNode(nodeId, { text });
    debouncedSave();
  }, [updateNode, debouncedSave]);

  const updateNodeStyle = useCallback((nodeId: string, style: any) => {
    updateNode(nodeId, { style });
    debouncedSave();
  }, [updateNode, debouncedSave]);

  const handleBackgroundMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === svgRef.current || (e.target as Element).classList.contains('mind-map-container')) {
      setIsPanning(true);
      setIsDragging(true);
      draggedNode.current = null;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      initialDragPos.current = { x: e.clientX, y: e.clientY };
      hasMoved.current = false;
    }
  }, []);

  const handleNodeDragStart = useCallback((nodeId: string, clientX: number, clientY: number) => {
    if (readOnly) return;
    
    setIsDragging(true);
    hasMoved.current = false;
    lastMousePos.current = { x: clientX, y: clientY };
    draggedNode.current = nodeId;
    
    // Set up nodes to move without changing selection
    nodesToMove.current = selectedNodes.includes(nodeId)
      ? selectedNodes.map(id => {
          const node = nodes.find(n => n.id === id);
          return {
            id,
            initialX: node?.x || 0,
            initialY: node?.y || 0
          };
        })
      : [{
          id: nodeId,
          initialX: nodes.find(n => n.id === nodeId)?.x || 0,
          initialY: nodes.find(n => n.id === nodeId)?.y || 0
        }];
  }, [readOnly, selectedNodes, nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && !isPanning) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.current = true;
    }

    if (isDragging && nodesToMove.current.length > 0) {
      setNodes(prev => prev.map(node => {
        const nodeToMove = nodesToMove.current.find(n => n.id === node.id);
        if (nodeToMove) {
          const newX = nodeToMove.initialX + (e.clientX - lastMousePos.current.x);
          const newY = nodeToMove.initialY + (e.clientY - lastMousePos.current.y);
          updateNodePosition(node.id, newX, newY);
          return {
            ...node,
            x: newX,
            y: newY,
            style: {
              ...node.style,
              x: newX,
              y: newY
            }
          };
        }
        return node;
      }));
    } else if (isPanning) {
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  }, [isDragging, isPanning, setNodes, updateNodePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
    draggedNode.current = null;
    nodesToMove.current = [];
  }, []);

  const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent<SVGGElement>) => {
    event.stopPropagation();
    
    // Only handle selection if we haven't started dragging
    if (!isDragging) {
      // Always toggle node in selection array - add if not present, remove if present
      setSelectedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    }
  }, [isDragging]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only clear selection if we clicked directly on the background and haven't moved
    if (!isDragging && 
        (e.target === svgRef.current || (e.target as Element).classList.contains('mind-map-container'))) {
      setSelectedNodes([]);
    }
  }, [isDragging]);

  const updateConnectionPoints = useCallback(() => {
    setConnections(prev => prev.map(conn => {
      const sourceNode = nodes.find(n => n.id === conn.source);
      const targetNode = nodes.find(n => n.id === conn.target);
      if (sourceNode && targetNode) {
        return {
          ...conn,
          points: [
            { x: sourceNode.x, y: sourceNode.y },
            { x: targetNode.x, y: targetNode.y }
          ]
        };
      }
      return conn;
    }));
  }, [nodes, setConnections]);

  useEffect(() => {
    updateConnectionPoints();
  }, [nodes, updateConnectionPoints]);

  const handleSave = useCallback(() => {
    if (!onSave) {
      console.log('No onSave handler provided');
      return;
    }

    const visitedNodes = new Set<string>();

    const findChildren = (nodeId: string): MindmapNode[] => {
      if (visitedNodes.has(nodeId)) {
        console.warn('Detected cycle or duplicate node:', nodeId);
        return [];
      }
      visitedNodes.add(nodeId);

      const childConnections = connections.filter(conn => conn.source === nodeId);
      console.log('Finding children for node:', nodeId);
      console.log('Found child connections:', childConnections);
      
      if (childConnections.length === 0) {
        return [];
      }

      return childConnections
        .map(conn => {
          const childNode = nodes.find(n => n.id === conn.target);
          if (!childNode) {
            console.log('Child node not found for connection:', conn);
            return null;
          }
          
          const node: MindmapNode = {
            id: childNode.id,
            text: childNode.text,
            children: findChildren(childNode.id),
            style: {
              ...(childNode.style || {}),
              width: childNode.style?.width ?? 120,
              height: childNode.style?.height ?? 40,
              backgroundColor: childNode.style?.backgroundColor,
              x: childNode.x,
              y: childNode.y,
            },
          };

          return node;
        })
        .filter((node): node is MindmapNode => node !== null);
    };

    const rootNodes = nodes.filter(node => 
      !connections.some(conn => conn.target === node.id)
    );

    console.log('Found root nodes:', rootNodes);

    if (rootNodes.length === 0) {
      console.error('No root nodes found in mindmap');
      if (nodes.length > 0) {
        const forcedRoot = nodes[0];
        console.log('Using first node as root:', forcedRoot);
        const mindmapData: MindmapNode = {
          id: forcedRoot.id,
          text: forcedRoot.text,
          children: findChildren(forcedRoot.id),
          style: {
            ...(forcedRoot.style || {}),
            width: forcedRoot.style?.width ?? 120,
            height: forcedRoot.style?.height ?? 40,
            backgroundColor: forcedRoot.style?.backgroundColor,
            x: forcedRoot.x,
            y: forcedRoot.y,
          },
        };
        console.log('Constructed mindmap data with forced root:', mindmapData);
        onSave(mindmapData);
      }
      return;
    }

    if (rootNodes.length > 1) {
      console.log('Multiple root nodes found, creating virtual root');
      const virtualRoot: MindmapNode = {
        id: 'virtual-root',
        text: 'Root',
        children: rootNodes.map(rootNode => ({
          id: rootNode.id,
          text: rootNode.text,
          children: findChildren(rootNode.id),
          style: {
            ...(rootNode.style || {}),
            width: rootNode.style?.width ?? 120,
            height: rootNode.style?.height ?? 40,
            backgroundColor: rootNode.style?.backgroundColor,
            x: rootNode.x,
            y: rootNode.y,
          },
        }))
      };
      console.log('Constructed mindmap data with virtual root:', virtualRoot);
      onSave(virtualRoot);
    } else {
      const rootNode = rootNodes[0];
      const mindmapData: MindmapNode = {
        id: rootNode.id,
        text: rootNode.text,
        children: findChildren(rootNode.id),
        style: {
          ...(rootNode.style || {}),
          width: rootNode.style?.width ?? 120,
          height: rootNode.style?.height ?? 40,
          backgroundColor: rootNode.style?.backgroundColor,
          x: rootNode.x,
          y: rootNode.y,
        },
      };
      console.log('Constructed mindmap data with single root:', mindmapData);
      onSave(mindmapData);
    }
  }, [nodes, connections, onSave]);

  const handleNodeDoubleClick = useCallback((nodeId: string, event: React.MouseEvent<SVGGElement>) => {
    event.stopPropagation();
    if (!readOnly) {
      startEditing(nodeId);
    }
  }, [readOnly, startEditing]);

  const handleNodeTextChange = useCallback((nodeId: string, newText: string) => {
    updateNodeText(nodeId, newText);
    stopEditing();
  }, [updateNodeText, stopEditing]);

  const handleNodeColorChange = useCallback((nodeId: string, color: string) => {
    updateNodeStyle(nodeId, { backgroundColor: color });
  }, [updateNodeStyle]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Autosaving mindmap...');
      handleSave();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [handleSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const convertDataToNodes = (
    data: MindmapNode, 
    defaultX = width / 2, 
    defaultY = height / 2, 
    parent: NodeType | null = null
  ): { nodes: NodeType[]; connections: ConnectionType[] } => {
    const nodeX = data.style?.x ?? defaultX;
    const nodeY = data.style?.y ?? defaultY;
    
    const node: NodeType = {
      id: data.id || Math.random().toString(36).substr(2, 9),
      text: data.text,
      x: nodeX,
      y: nodeY,
      style: {
        width: data.style?.width ?? 120,
        height: data.style?.height ?? 40,
        backgroundColor: data.style?.backgroundColor,
        x: nodeX,
        y: nodeY
      },
    };

    let result = { nodes: [node], connections: [] as ConnectionType[] };

    if (parent) {
      result.connections.push({
        source: parent.id,
        target: node.id,
        points: [
          { x: parent.x, y: parent.y },
          { x: node.x, y: node.y }
        ],
      });
    }

    if (data.children && data.children.length > 0) {
      const spacing = 150;
      const totalWidth = (data.children.length - 1) * spacing;
      const startX = nodeX - totalWidth / 2;

      data.children.forEach((child, index) => {
        const childDefaultX = startX + index * spacing;
        const childDefaultY = nodeY + 150;
        const childResult = convertDataToNodes(child, childDefaultX, childDefaultY, node);
        
        result.nodes.push(...childResult.nodes);
        result.connections.push(...childResult.connections);
      });
    }

    return result;
  };

  useEffect(() => {
    const { nodes: initialNodes, connections: initialConnections } = convertDataToNodes(data);
    setNodes(initialNodes);
    setConnections(initialConnections);
  }, [data, width, height, setNodes, setConnections]);

  return (
    <Box>
      {!readOnly && <MindmapToolbar onSave={() => handleSave()} />}
      <Paper
        ref={containerRef}
        sx={{
          width,
          height,
          overflow: 'hidden',
          position: 'relative',
          cursor: isPanning ? 'grabbing' : 'grab',
          backgroundColor: '#f5f5f5',
        }}
        onMouseDown={handleBackgroundMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleBackgroundClick}
      >
        <svg
          ref={svgRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#000000" />
            </marker>
          </defs>
          {connections.map((connection) => (
            <path
              key={`${connection.source}-${connection.target}`}
              d={`M ${connection.points?.[0].x} ${connection.points?.[0].y} L ${connection.points?.[1].x} ${connection.points?.[1].y}`}
              stroke={
                selectedNodes.includes(connection.source) && 
                selectedNodes.includes(connection.target)
                  ? '#2196f3'
                  : '#000'
              }
              strokeWidth={
                selectedNodes.includes(connection.source) && 
                selectedNodes.includes(connection.target)
                  ? 2
                  : 1
              }
              fill="none"
              markerEnd="url(#arrow)"
            />
          ))}
          {nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onMouseDown={(e: React.MouseEvent<SVGGElement>) => {
                e.stopPropagation();
                handleNodeDragStart(node.id, e.clientX, e.clientY);
              }}
              onDoubleClick={(e: React.MouseEvent<SVGGElement>) => {
                e.stopPropagation();
                handleNodeDoubleClick(node.id, e);
              }}
              onClick={(e: React.MouseEvent<SVGGElement>) => {
                e.stopPropagation();
                handleNodeClick(node.id, e);
              }}
            >
              <rect
                x={-60}
                y={-20}
                width={120}
                height={40}
                rx={5}
                fill={node.style?.backgroundColor || '#fff'}
                stroke={selectedNodes.includes(node.id) ? '#2196f3' : '#000'}
                strokeWidth={selectedNodes.includes(node.id) ? 2 : 1}
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  userSelect: 'none',
                  fontSize: '14px',
                  fontFamily: 'Arial',
                }}
              >
                {node.text}
              </text>
            </g>
          ))}
        </svg>
      </Paper>
    </Box>
  );
};
