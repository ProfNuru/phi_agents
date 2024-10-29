from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List
from db import Base
from db import engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    agents: Mapped[List["Agent"]] = relationship(back_populates="user",
                                                    cascade="all, delete-orphan")
    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}) has {len(self.agents)} agents"

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete='cascade'))
    user: Mapped["User"] = relationship(back_populates="agents")

    name = Column(String, unique=True, index=True)
    model = Column(String)
    api_key=Column(String)
    show_tool_calls = Column(Boolean, default=True)
    markdown = Column(Boolean, default=True)
    instructions: Mapped[List["Instructions"]] = relationship(back_populates="agent",
                                                    cascade="all, delete-orphan")
    tools: Mapped[List["Tool"]] = relationship(back_populates="agent",
                                                    cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship(back_populates="agent",
                                                    cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"Agent(id={self.id!r}, name={self.name!r}) belongs to {self.user.email}"


class Instructions(Base):
    __tablename__ = "instructions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id",ondelete='cascade'))
    agent: Mapped["Agent"] = relationship(back_populates="instructions")

    text = Column(String)

    def __repr__(self) -> str:
        return f"Instruction(id={self.id!r}, name={self.text!r}) for {self.agent.name}"

class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id",ondelete='cascade'))
    agent: Mapped["Agent"] = relationship(back_populates="tools")

    tool = Column(String)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id",ondelete='cascade'))
    agent: Mapped["Agent"] = relationship(back_populates="conversations")
    author = Column(String)
    prompt = Column(String)

User.metadata.create_all(bind=engine)
Agent.metadata.create_all(bind=engine)
Conversation.metadata.create_all(bind=engine)
Instructions.metadata.create_all(bind=engine)
Tool.metadata.create_all(bind=engine)
