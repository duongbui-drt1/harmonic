export interface GraphNode {
  id: string;
  label: string;
  type: "current" | "resolution" | "secondary_dominant" | "substitute" | "borrowed";
  description: string;
  probability: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface HarmonicGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildHarmonicGraph(chords: string[], keyRoot = "C"): HarmonicGraphData {
  if (!chords || chords.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add current progression chords as nodes
  chords.forEach((c, idx) => {
    const id = `chord-${idx}-${c}`;
    nodes.push({
      id,
      label: c,
      type: "current",
      description: `Hợp âm thứ ${idx + 1} trong vòng hòa âm.`,
      probability: 1.0,
    });

    if (idx > 0) {
      const prevId = `chord-${idx - 1}-${chords[idx - 1]}`;
      edges.push({
        source: prevId,
        target: id,
        label: "chuyển tiếp",
      });
    }
  });

  // For the last chord, add suggested destination nodes
  const lastChord = chords[chords.length - 1];
  const lastId = `chord-${chords.length - 1}-${lastChord}`;

  const resNodes: GraphNode[] = [
    { id: "dest-tonic", label: `${keyRoot}maj7`, type: "resolution", description: "Giải về Chủ âm Tonic tự nhiên.", probability: 0.85 },
    { id: "dest-sec-dom", label: "A7", type: "secondary_dominant", description: "Độn sang At phụ A7 dẫn về Dm7.", probability: 0.70 },
    { id: "dest-sub", label: "Db7", type: "substitute", description: "Thay thế tam thanh Tritone Sub Db7.", probability: 0.65 },
    { id: "dest-borrowed", label: "Abmaj7", type: "borrowed", description: "Hợp âm vay mượn bVI mượt mà.", probability: 0.60 },
  ];

  resNodes.forEach((n) => {
    nodes.push(n);
    edges.push({
      source: lastId,
      target: n.id,
      label: n.type,
    });
  });

  return { nodes, edges };
}
