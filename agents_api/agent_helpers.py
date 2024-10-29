from pydantic import BaseModel
from sqlalchemy.orm import Session
from models import User, Agent, Instructions, Tool

class AgentCreate(BaseModel):
    name:str
    model:str
    api_key:str
    instructions:list[str]
    tools:list[str]
    show_tool_calls:bool=True
    markdown:bool=True

class InstructionCreate(BaseModel):
    text:str

class ToolCreate(BaseModel):
    tool:str

class AgentPrompt(BaseModel):
    prompt:str

def update_agent(db:Session, agent_id:int, data:AgentCreate):
    # Delete associated instructions
    db.query(Instructions).filter(Instructions.agent_id==agent_id).delete(synchronize_session=False)

    # Delete associated tools
    db.query(Tool).filter(Tool.agent_id==agent_id).delete(synchronize_session=False)

    db_agent = db.query(Agent).filter(Agent.id==agent_id).update({
        "name":data.name,
        "markdown":data.markdown,
        "show_tool_calls":data.show_tool_calls,
        "api_key":data.api_key,
        "model":data.model,
    })


    db_agent.commit()

    for instruction in data.instructions:
        new_instruction = Instructions(
            text=instruction,
            agent_id=db_agent.id
        )
        db_agent.instructions.append(new_instruction)

    for tool in data.tools:
        new_tool = Tool(
            tool=tool,
            agent_id=db_agent.id
        )
        db_agent.tools.append(new_tool)
    return db_agent.id

def create_agent(db:Session, user_email:str, data:AgentCreate):
    db_user = db.query(User).filter(User.email==user_email).first()
    new_agent = Agent(
        user=db_user,
        name=data.name,
        model=data.model,
        api_key=data.api_key,
        show_tool_calls=data.show_tool_calls,
        markdown=data.markdown
    )
    for instruction in data.instructions:
        new_agent.instructions.append(Instructions(text=instruction))

    for tool in data.tools:
        new_agent.tools.append(Tool(tool=tool))

    db.add(new_agent)
    db.commit()
    return True
