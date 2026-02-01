from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud
from db import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware

# create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# DATABASE DEPENDENCY
# --------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------
# USERS
# --------------------

@app.post("/users")
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    return crud.create_or_get_user(db, user.email, user.role)


# --------------------
# CAMPAIGNS
# --------------------

@app.post("/campaigns")
def create_campaign(
    campaign: schemas.CampaignCreate,
    db: Session = Depends(get_db)
):
    return crud.create_campaign(
        db,
        campaign.vendor_id,
        campaign.product_name,
        campaign.description,
    )


@app.get("/campaigns")
def get_campaigns(db: Session = Depends(get_db)):
    return crud.get_all_campaigns(db)


# --------------------
# CHATS
# --------------------

@app.post("/chats")
def create_or_get_chat(
    chat: schemas.ChatCreate,
    db: Session = Depends(get_db)
):
    return crud.create_or_get_chat(
        db,
        chat.campaign_id,
        chat.vendor_id,
        chat.influencer_id,
    )


@app.get("/chats/user/{user_id}")
def get_user_chats(user_id: int, db: Session = Depends(get_db)):
    return crud.get_chats_by_user(db, user_id)


# --------------------
# MESSAGES
# --------------------

@app.post("/messages", response_model=schemas.MessageOut)
def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db)
):
    return crud.create_message(
        db,
        message.chat_id,
        message.sender_id,
        message.text,
    )


@app.get("/messages/{chat_id}", response_model=List[schemas.MessageOut])
def get_messages(
    chat_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_messages_by_chat(db, chat_id)

# --------------------
# TOKENS
# --------------------

@app.get("/tokens/{user_id}")
def get_tokens(user_id: int, db: Session = Depends(get_db)):
    tokens = crud.get_user_tokens(db, user_id)
    return {"tokens": tokens}


@app.post("/tokens/deduct")
def deduct_user_tokens(
    user_id: int,
    amount: int,
    db: Session = Depends(get_db)
):
    result = crud.deduct_tokens(db, user_id, amount)

    if result == "INSUFFICIENT":
        return {"error": "Not enough tokens"}

    return {"tokens": result}

# -------- PROFILES --------

@app.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    return crud.get_profile(db, user_id)


@app.post("/profile")
def save_profile(
    profile: schemas.ProfileCreate,
    db: Session = Depends(get_db)
):
    return crud.create_or_update_profile(db, profile)
