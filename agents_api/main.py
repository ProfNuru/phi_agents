from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from phi.agent import Agent as PhiAgent
from models import User, Agent, Instructions, Tool, Conversation
from ai_models import AI_MODELS, AI_TOOLS
from agent_helpers import (
    AgentCreate,
    AgentPrompt,
    create_agent,
    update_agent
)
from auth_helpers import (
    UserCreate,
    get_user_by_email,
    create_user,
    get_db,
    authenticate_user,
    create_access_token,
    verify_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app  = FastAPI()
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/test/")
async def test():
    return {"message":"Welcome to agents"}

@app.post("/api/v1/register/")
async def register_user(user:UserCreate, db:Session=Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User exists with this E-mail")
    return create_user(db=db, user=user)

@app.post("/api/v1/login/")
async def login_for_access_token(form_data:UserCreate, db:Session = Depends(get_db)):
    user = authenticate_user(form_data.email, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate":"Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type":"bearer"}

@app.get("/api/v1/verify-token/{token}/")
async def verify_user_token(token:str):
    verify_token(token=token)
    return {"success":True, "message":"Token is valid"}

@app.get("/api/v1/me/")
async def get_me(user_email: Annotated[User, Depends(get_current_user)], db:Session = Depends(get_db)):
    current_user = get_user_by_email(db, user_email)
    # print({"current_user":current_user})
    return {
        "id":current_user.id,
        "email":current_user.email,
        "agents":current_user.agents
    }

@app.get("/api/v1/agents/")
async def get_all_agents(user_email: Annotated[User, Depends(get_current_user)], db:Session = Depends(get_db)):
    current_user = get_user_by_email(db, user_email)
    return {"agents":current_user.agents}

@app.post("/api/v1/agents")
async def create_new_agent(user_email: Annotated[User, Depends(get_current_user)], data:AgentCreate, db:Session=Depends(get_db)):
    if not AI_MODELS[data.model]:
        raise HTTPException(status_code=403, detail="Model is not available")

    for tool in data.tools:
        if not AI_TOOLS[tool]:
            raise HTTPException(status_code=403, detail="One or more tools are not available")

    return create_agent(db=db, user_email=user_email, data=data)


@app.patch("/api/v1/agents/{agent_id}/")
async def update_existing_agent(agent_id:int, user_email: Annotated[User, Depends(get_current_user)], data:AgentCreate, db:Session=Depends(get_db)):
    if not AI_MODELS[data.model]:
        raise HTTPException(status_code=403, detail="Model is not available")

    for tool in data.tools:
        if not AI_TOOLS[tool]:
            raise HTTPException(status_code=403, detail="One or more tools are not available")

    agent = db.query(Agent).filter(Agent.id==agent_id).first()
    if agent:
        return update_agent(db=db, agent_id=agent.id, data=data)
    raise HTTPException(status_code=400, detail="Invalid agent ID")

@app.get("/api/v1/agents/{agent_id}/")
async def get_one_agent(agent_id:int, db:Session=Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id==agent_id).first()
    if agent:
        return {
            "agent":agent
        }
    raise HTTPException(status_code=400, detail="Invalid agent ID")


@app.delete("/api/v1/agents/{agent_id}/")
async def delete_agent(agent_id:int, db:Session=Depends(get_db)):
    db.query(Instructions).filter(Instructions.agent_id==agent_id).delete(synchronize_session=False)
    db.query(Tool).filter(Tool.agent_id==agent_id).delete(synchronize_session=False)
    db.query(Agent).filter(Agent.id==agent_id).delete(synchronize_session=False)

    db.commit()

    return "Agent deleted"

@app.post("/api/v1/prompt/{agent_id}/")
async def prompt_agent(agent_id:int, data:AgentPrompt, db:Session=Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id==agent_id).first()
    agent_tools = []
    agent_instructions = []
    for tool in agent.tools:
        if tool in AI_TOOLS:
            tool_class = AI_TOOLS[tool]['tool']
            if AI_TOOLS[tool]['options'] is None:
                agent_tools.append(tool_class())
            else:
                kwargs = AI_TOOLS[tool]['options']
                agent_tools.append(tool_class(**kwargs))

    for instr in  agent.instructions:
        agent_instructions.append(instr.text)

    # model_instance = None
    if agent.model in AI_MODELS:
        model = AI_MODELS[agent.model]["model"]
        if AI_MODELS[agent.model]["options"] is None:
            agent_instance = PhiAgent(
                name=agent.name,
                model=model(),
                tools=agent_tools,
                instructions=agent_instructions,
                show_tool_calls=agent.show_tool_calls,
                markdown=agent.markdown,
            )
            db_user_prompt = Conversation(
                author='user',
                prompt=data.prompt,
                agent_id=agent.id
            )
            db.add(db_user_prompt)
            db.commit()
            # agent_instance.print_response(data.prompt, stream=True)
            response = agent_instance.run(data.prompt)
            db_assistant_prompt = Conversation(
                author='assistant',
                prompt=response.content,
                agent_id=agent.id
            )
            db.add(db_assistant_prompt)
            db.commit()
            return {
                "response":response.content
            }
        else:
            kwargs = AI_MODELS[agent.model]["options"]
            agent_instance = PhiAgent(
                name=agent.name,
                model=model(**kwargs, api_key=agent.api_key),
                tools=agent_tools,
                instructions=agent_instructions,
                show_tool_calls=agent.show_tool_calls,
                markdown=agent.markdown,
            )
            db_user_prompt = Conversation(
                author='user',
                prompt=data.prompt,
                agent_id=agent.id
            )
            db.add(db_user_prompt)
            db.commit()
            # agent_instance.print_response(data.prompt, stream=True)
            response = agent_instance.run(data.prompt)
            db_assistant_prompt = Conversation(
                author='assistant',
                prompt=response.content,
                agent_id=agent.id
            )
            db.add(db_assistant_prompt)
            db.commit()
            return {
                "response":response.content
            }



@app.get("/api/v1/prompt/{agent_id}/")
async def get_message_history(agent_id:int, db:Session=Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id==agent_id).first()
    return {
        "messages":agent.conversations
    }
