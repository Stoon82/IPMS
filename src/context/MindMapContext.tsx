import React, { createContext, useContext, useState, useCallback } from 'react';

interface Node {
    id: string;
    text: string;
    x: number;
    y: number;
    style?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
    };
}

interface Connection {
    source: string;
    target: string;
    points?: { x: number; y: number }[];
}

interface MindMapContextType {
    nodes: Node[];
    connections: Connection[];
    selectedNodes: string[];
    editingNodeId: string | null;
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
    setConnections: (connections: Connection[] | ((prev: Connection[]) => Connection[])) => void;
    setSelectedNodes: (nodes: string[] | ((prev: string[]) => string[])) => void;
    updateConnection: (source: string, target: string, points: { x: number; y: number }[]) => void;
    updateNode: (id: string, updates: Partial<Node>) => void;
    addConnection: (source: string, target: string) => void;
    toggleSelectNode: (id: string) => void;
    startEditing: (id: string) => void;
    stopEditing: () => void;
    deleteSelectedNodes: () => void;
    updateSelectedNodesBackgroundColor: (color: string) => void;
}

const MindMapContext = createContext<MindMapContextType | null>(null);

export const MindMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

    const updateConnection = useCallback((source: string, target: string, points: { x: number; y: number }[]) => {
        setConnections(prev => prev.map(conn => 
            conn.source === source && conn.target === target
                ? { ...conn, points }
                : conn
        ));
    }, []);

    const updateNode = useCallback((id: string, updates: Partial<Node>) => {
        setNodes(prev => prev.map(node => 
            node.id === id ? { ...node, ...updates } : node
        ));
    }, []);

    const addConnection = useCallback((source: string, target: string) => {
        setConnections(prev => [...prev, { source, target }]);
    }, []);

    const toggleSelectNode = useCallback((id: string) => {
        setSelectedNodes(prev => {
            if (prev.includes(id)) {
                return prev.filter(nodeId => nodeId !== id);
            }
            return [...prev, id];
        });
    }, []);

    const startEditing = useCallback((id: string) => {
        setEditingNodeId(id);
    }, []);

    const stopEditing = useCallback(() => {
        setEditingNodeId(null);
    }, []);

    const deleteSelectedNodes = useCallback(() => {
        setNodes(prev => prev.filter(node => !selectedNodes.includes(node.id)));
        setConnections(prev => prev.filter(conn => 
            !selectedNodes.includes(conn.source) && !selectedNodes.includes(conn.target)
        ));
        setSelectedNodes([]);
    }, [selectedNodes]);

    const updateSelectedNodesBackgroundColor = useCallback((color: string) => {
        setNodes(prev => prev.map(node => 
            selectedNodes.includes(node.id)
                ? { ...node, style: { ...node.style, backgroundColor: color } }
                : node
        ));
    }, [selectedNodes]);

    return (
        <MindMapContext.Provider value={{
            nodes,
            connections,
            selectedNodes,
            editingNodeId,
            setNodes,
            setConnections,
            setSelectedNodes,
            updateConnection,
            updateNode,
            addConnection,
            toggleSelectNode,
            startEditing,
            stopEditing,
            deleteSelectedNodes,
            updateSelectedNodesBackgroundColor,
        }}>
            {children}
        </MindMapContext.Provider>
    );
};

export const useMindMap = () => {
    const context = useContext(MindMapContext);
    if (!context) {
        throw new Error('useMindMap must be used within a MindMapProvider');
    }
    return context;
};
