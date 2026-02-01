from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserCreate(BaseModel):
    email: str
    role: str


class CampaignCreate(BaseModel):
    vendor_id: int
    product_name: str
    description: str


class ChatCreate(BaseModel):
    campaign_id: int
    vendor_id: int
    influencer_id: int


class MessageCreate(BaseModel):
    chat_id: int
    sender_id: int
    text: str


class MessageOut(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    text: str
    created_at: datetime

    class Config:
        orm_mode = True

class ProfileCreate(BaseModel):
    user_id: int
    name: str
    niche: str
    followers_range: str
    engagement: str
    bio: Optional[str] = ""
    availability: str
    content_types: List[str]

class ProfileOut(ProfileCreate):
    pass