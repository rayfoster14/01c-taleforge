import React from 'react';
import { Handle } from 'reactflow';

function EmotionNode({ data }) {
  return (
    <div style={{
      padding: 5,
      border: '1px solid #ddd',
      borderRadius: 35,
      background: '#ffffff88',
      textAlign: 'center',
      width: 35,
      height:36,
      boxShadow:'0px 1px 1px 0px #999'

    }}>
      <img src={`/emoticons/${data.emotion}.gif`}  />
  
      <Handle type="target" position="top" />
      <Handle type="source" position="bottom" />
    </div>
  );
}

export default EmotionNode;
