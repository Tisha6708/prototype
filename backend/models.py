from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)  # "vendor" or "influencer"
    tokens = Column(Integer, default=200)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True)
    vendor_id = Column(Integer, ForeignKey("users.id"))
    product_name = Column(String)
    description = Column(Text)


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    vendor_id = Column(Integer, ForeignKey("users.id"))
    influencer_id = Column(Integer, ForeignKey("users.id"))


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class InfluencerProfile(Base):
    __tablename__ = "influencer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)

    name = Column(String)
    niche = Column(String)
    followers_range = Column(String)
    engagement = Column(String)
    bio = Column(Text)
    availability = Column(String)
    content_types = Column(String)  # stored as comma-separated