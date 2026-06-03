from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    resumes = relationship("ResumeHistory", back_populates="user")


class ResumeHistory(Base):
    __tablename__ = "resume_history"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    score = Column(Integer, default=0)
    analysis = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="resumes")
