from fastapi import FastAPI, Depends, HTTPException
from dotenv import load_dotenv
from pathlib import Path
import os
from dotenv import load_dotenv
import google.generativeai as genai


# Load environment variables from backend/.env as early as possible
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import json

import models, schemas, crud
from db import engine, SessionLocal
from schemas import BillCreate

# --------------------
# DB + APP SETUP
# --------------------
from fastapi import Request
from fastapi.responses import Response
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.options("/{path:path}")
def options_handler(path: str, request: Request):
    return Response(status_code=200)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
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
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_or_get_user(db, user.email, user.role)

# --------------------
# CAMPAIGNS
# --------------------

@app.post("/campaigns")
def create_campaign(campaign: schemas.CampaignCreate, db: Session = Depends(get_db)):
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
def create_or_get_chat(chat: schemas.ChatCreate, db: Session = Depends(get_db)):
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
def send_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    return crud.create_message(
        db,
        message.chat_id,
        message.sender_id,
        message.text,
    )

@app.get("/messages/{chat_id}", response_model=List[schemas.MessageOut])
def get_messages(chat_id: int, db: Session = Depends(get_db)):
    return crud.get_messages_by_chat(db, chat_id)

# --------------------
# TOKENS
# --------------------

@app.get("/tokens/{user_id}")
def get_tokens(user_id: int, db: Session = Depends(get_db)):
    return {"tokens": crud.get_user_tokens(db, user_id)}

@app.post("/tokens/deduct")
def deduct_user_tokens(user_id: int, amount: int, db: Session = Depends(get_db)):
    result = crud.deduct_tokens(db, user_id, amount)
    if result == "INSUFFICIENT":
        return {"error": "Not enough tokens"}
    return {"tokens": result}

# --------------------
# PROFILES
# --------------------

@app.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    return crud.get_profile(db, user_id)

@app.post("/profile")
def save_profile(profile: schemas.ProfileCreate, db: Session = Depends(get_db)):
    return crud.create_or_update_profile(db, profile)

# --------------------
# PRODUCTS
# --------------------

@app.post("/products", response_model=schemas.ProductOut)
def add_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@app.get("/products")
def get_products(vendor_id: int, db: Session = Depends(get_db)):
    return crud.get_products(db, vendor_id)

# --------------------
# BILLS
# --------------------

@app.post("/bills", response_model=schemas.BillOut)
def create_bill(bill: BillCreate, db: Session = Depends(get_db)):
    return crud.create_bill(db, bill)

# --------------------
# ANALYTICS (UNCHANGED)
# --------------------

@app.get("/analytics/{vendor_id}")
def analytics(vendor_id: int, db: Session = Depends(get_db)):
    sales = db.execute(
        text("""
            SELECT 
                p.product_name AS name,
                SUM(b.quantity) AS quantity,
                SUM(b.quantity * b.selling_price) AS revenue,
                SUM(b.quantity * b.cost_price) AS cost,
                SUM(b.quantity * b.selling_price)
                - SUM(b.quantity * b.cost_price) AS profit
            FROM bills b
            JOIN products p ON p.id = b.product_id
            WHERE b.vendor_id = :vendor_id
            GROUP BY p.product_name
        """),
        {"vendor_id": vendor_id}
    ).mappings().all()

    total_revenue = sum(s["revenue"] or 0 for s in sales)
    total_cost = sum(s["cost"] or 0 for s in sales)
    total_profit = sum(s["profit"] or 0 for s in sales)
    total_units = sum(s["quantity"] or 0 for s in sales)

    return {
        "kpis": {
            "total_revenue": total_revenue,
            "total_cost": total_cost,
            "total_profit": total_profit,
            "total_units_sold": total_units,
            "product_count": len(sales),
        },
        "sales": sales,
    }

# --------------------
# AI MARKETING INSIGHTS (NEW, SAFE)
# --------------------

@app.get("/analytics/{vendor_id}/marketing")
def marketing_insights(vendor_id: int, db: Session = Depends(get_db)):
    raw_analytics = analytics(vendor_id, db)

    ai_data = crud.extract_ai_analytics(raw_analytics)
    crud.validate_ai_analytics(ai_data)

    ai_text = crud.generate_marketing_insights(ai_data)

    return {
        "marketing_insights": crud.safe_parse_ai_response(ai_text)
    }
