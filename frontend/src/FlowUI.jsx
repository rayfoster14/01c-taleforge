import React, { useEffect,useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import EmotionNode from './EmotionNode';

const nodeTypes = {
  emotion: EmotionNode
};

//Correspond to emotions and the .gif files
const emotions = ['happy','sad','angry','embarrassed','silly'];

let nodeIdCounter = 3;

//Initial node to start if not saved
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: `Let's start the story...` },
    position: { x: 10, y: 10 },
    selectable: false,
    draggable: false,
  }
];


function FlowCanvas(props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [runOutput, setRunOutput] = useState('');
  const [showEmoticons, setShowEmoticons] = useState(true);
  const [aiLoading, setAiLoading]=useState(false);
  

  // ✅ Load flow data on mount
 useEffect(function () {
  // Check URL param
  const params = new URLSearchParams(window.location.search);
  const flowDataParam = params.get('flow_data');

  if (flowDataParam) {
    try {
      const decoded = decodeURIComponent(atob(flowDataParam));
      const parsed = JSON.parse(decoded);

      // Always ensure input/output nodes exist
      if (!parsed.nodes.find(n => n.type === 'input')) {
        parsed.nodes.push(initialNodes[0]);
      }
 
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      return; // Exit early so we don't load user flow after this
    } catch (e) {
      console.error('Failed to parse flow_data from URL:', e);
    }
  }


  // If no flow_data param, load user flow from backend
  if (props.userId) {
    fetch(`/api/user-flow/${props.userId}`)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        let loadedNodes = data.nodes || [];
        let loadedEdges = data.edges || [];

        if (!loadedNodes.find(n => n.type === 'input')) {
          loadedNodes.push(initialNodes[0]);
        }
        

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      })
      .catch(function (err) {
        console.error('Failed to load flow:', err);
      });
  }
}, [props.userId]);


  function onConnect(params) {
    setEdges(function (eds) {
      return addEdge(params, eds);
    });
  }

  function onShowEmoticons(){
    setShowEmoticons(!showEmoticons);
  }

  function addNode(type) {
      setShowEmoticons(true);

  const newId = String(nodeIdCounter++);
;
  let nodeType = 'emotion';

  if (type === 'input') {
    nodeType = 'input';
  } 

  const newNode = {
    id: newId,
    type: nodeType,
    data: { label: type, emotion:type, nodeType },
    position: {x:(newId*50)-100, y: 100}
  };

  setNodes(function (nds) {
    return nds.concat(newNode);
  });

}


 function onDeleteSelected() {
  setNodes(function (nds) {
    return nds.filter(function (node) {
      // Prevent deleting input/output nodes by id
      if (node.id === '1' || node.id === '2') {
        return true;
      }
      return !node.selected;
    });
  });

  setEdges(function (eds) {
    return eds.filter(function (edge) {
      return !edge.selected;
    });
  });
}


  function publishFlow() {
    const flowData = {
      nodes: nodes,
      edges: edges
    };

    fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: props.userId,
        flowData: flowData
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        alert('Published: ' + data.message);
      })
      .catch(function (err) {
        alert('Failed to publish: ' + err.message);
      });
  }

  
function runFlow() {
  setAiLoading(true);
  if (nodes.length === 0 || edges.length === 0) {
    setRunOutput('No nodes or edges to run.');
    setAiLoading(false);
    return;
  }

  const inputNode = nodes.find(function (node) {
    return node.type === 'input';
    setAiLoading(false);
  });

  if (!inputNode) {
    setRunOutput('No input node found.');
    setAiLoading(false);
    return;
  }

  const pathNodes = [];
  let currentNodeId = inputNode.id;
  let safetyCounter = 0; // prevent infinite loops

  while (safetyCounter < 100) {
    const currentNode = nodes.find(function (n) { return n.id === currentNodeId; });
    if (!currentNode) break;
    pathNodes.push(currentNode);

    // Find edges where current node is the source
    const outgoingEdges = edges.filter(function (edge) {
      return edge.source === currentNodeId;
    });

    if (outgoingEdges.length === 0) {
      // No further nodes connected, stop traversal
      break;
    }

    // For simplicity, just take the first outgoing edge
    currentNodeId = outgoingEdges[0].target;

    safetyCounter++;
  }

  if (safetyCounter === 100) {
    setRunOutput('This flow is too emotional.');
    setAiLoading(false);
    return;
  }

  const emotionList = pathNodes.map(function (node) {
    return node.data.emotion;
  });

  try{
      fetch('/api/generateStory',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({emotionList})
      }).then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || 'Error');
          }
          return data;
        });
      }) .then(function (data) {
        setRunOutput(data.story);
        setAiLoading(false);
      })
      

  }catch(error){
    setRunOutput('There was an error connecting to our AI backend...');
    setAiLoading(false);
  }

}






  function shareFlow() {
  const flowData = {
    nodes: nodes,
    edges: edges
  };

  try {
    const jsonString = JSON.stringify(flowData);
    const base64 = btoa(encodeURIComponent(jsonString));
    const shareUrl = window.location.origin + window.location.pathname + '?flow_data=' + base64;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(function () {
      alert('Share URL copied to clipboard!');
    }, function (err) {
      alert('Failed to copy URL: ' + err);
    });
  } catch (e) {
    alert('Error encoding flow data: ' + e.message);
  }
}


  return (
    <div>
      <div style={{ marginBottom: '10px', marginTop:'20px' }} className="center">
      <button className="extend circle" onClick={onShowEmoticons}><i>add</i><span>Add Emotion</span></button>
      <button className="extend circle" onClick={onDeleteSelected} ><i>remove</i><span>Remove Node</span></button>
      <button className="extend circle" onClick={publishFlow} ><i>save</i><span>Save</span></button>
      <button className="extend circle" onClick={shareFlow} ><i>share</i><span>Share</span></button>
      <button style={{display:!aiLoading?'inline-flex':'none'}} className="extend circle"onClick={runFlow} ><i>play_circle</i><span>Run</span></button>
      <button style={{display:aiLoading?'inline-flex':'none'}} className=" circle"><progress class="circle small"></progress></button>
    </div>
    <div hidden={showEmoticons}  style={{backgroundColor:"var(--secondary-container)", padding:10, marginBottom:10, marginTop:10}}>
      {
        emotions.map(function(emotion,i){
          return (
            <button className="extend circle" key={`${emotion},${i}`} onClick={function(){ addNode(emotion)}}>
              <img src={`/emoticons/${emotion}.gif`} />
              <span>{emotion}</span>
            </button>)
          })
      }
    </div>
      <div style={{ height: '500px', width:'600px', border: '1px solid #ccc' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <div style={{
        marginTop: '10px',
        padding: '10px',
        border: '1px solid #666',
        borderRadius: '4px',
        minHeight: '50px',
        backgroundColor: '#f7f7f7',
        fontFamily: 'monospace'
      }}>
        <strong>Run Output:</strong>
        <div>{runOutput || <em>No nodes to display</em>}</div>
      </div>
    </div>
  );
}

export default function FlowUI(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas userId={props.userId} />
    </ReactFlowProvider>
  );
}
