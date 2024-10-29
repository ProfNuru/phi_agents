import axios from 'axios'
import React from 'react'
import ChatArea from '../../_components/chat-area';

const ChatAgentPage = async ({params}:{params:{agent_id:string}}) => {
    const agent_id = params.agent_id;
    console.log({agent_id});

    const url = `${process.env.BASE_API_ROUTE}/prompt/${agent_id}/`;
    const response = await axios.get(url);
    const conversations = response.data;
  return (
    <ChatArea agentId={agent_id} messages={conversations.messages} />
  )
}

export default ChatAgentPage
