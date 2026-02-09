from sqlalchemy.orm import Session
from sqlalchemy import text
import models
import json
import os
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv
from pathlib import Path

# Load .env relative to this file to ensure the key is available
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found in environment")

genai.configure(api_key=api_key)


# --------------------
# USERS
# --------------------

def create_or_get_user(db: Session, email: str, role: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(email=email, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_tokens(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.tokens if user else 0

def deduct_tokens(db: Session, user_id: int, amount: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.tokens < amount:
        return "INSUFFICIENT"
    user.tokens -= amount
    db.commit()
    return user.tokens

def create_campaign(db: Session, vendor_id: int, product_name: str, description: str):
    campaign = models.Campaign(
        vendor_id=vendor_id,
        product_name=product_name,
        description=description
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def get_all_campaigns(db: Session):
    return db.query(models.Campaign).all()




def create_or_get_chat(
    db: Session,
    campaign_id: int,
    vendor_id: int,
    influencer_id: int
):
    chat = (
        db.query(models.Chat)
        .filter(
            models.Chat.campaign_id == campaign_id,
            models.Chat.vendor_id == vendor_id,
            models.Chat.influencer_id == influencer_id
        )
        .first()
    )

    if not chat:
        chat = models.Chat(
            campaign_id=campaign_id,
            vendor_id=vendor_id,
            influencer_id=influencer_id
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)

    return chat


def get_chats_by_user(db: Session, user_id: int):
    return (
        db.query(models.Chat)
        .filter(
            (models.Chat.vendor_id == user_id) |
            (models.Chat.influencer_id == user_id)
        )
        .all()
    )

def create_message(
    db: Session,
    chat_id: int,
    sender_id: int,
    text: str
):
    message = models.Message(
        chat_id=chat_id,
        sender_id=sender_id,
        text=text
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_messages_by_chat(
    db: Session,
    chat_id: int
):
    return (
        db.query(models.Message)
        .filter(models.Message.chat_id == chat_id)
        .order_by(models.Message.created_at)
        .all()
    )


# --------------------
# ANALYTICS → AI ADAPTER
# --------------------

def extract_ai_analytics(analytics: dict) -> dict:
    # Convert SQLAlchemy RowMapping → dict
    sales = [dict(row) for row in analytics.get("sales", [])]
    kpis = analytics.get("kpis", {})

    total_revenue = kpis.get("total_revenue", 0)
    total_units = kpis.get("total_units_sold", 0)

    avg_order_value = total_revenue / total_units if total_units else 0

    top_products = sorted(
        sales, key=lambda x: x["quantity"], reverse=True
    )[:3]

    low_products = sorted(
        sales, key=lambda x: x["quantity"]
    )[:3]

    return {
        "revenue": {
            "total": total_revenue
        },
        "orders": {
            "total": total_units,
            "average_order_value": round(avg_order_value, 2)
        },
        "products": {
            "top": top_products,
            "low": low_products
        }
    }


def validate_ai_analytics(data: dict):
    if data["orders"]["total"] == 0:
        raise HTTPException(status_code=400, detail="No sales data for AI insights")
    if data["revenue"]["total"] < 1:
        raise HTTPException(status_code=400, detail="Revenue too low for AI insights")
    

def create_product(db: Session, product):
    new_product = models.Product(
        vendor_id=product.vendor_id,
        product_name=product.product_name,
        cost_price=product.cost_price,
        quantity_available=product.quantity_available,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

def get_products(db: Session, vendor_id: int):
    return (
        db.query(models.Product)
        .filter(models.Product.vendor_id == vendor_id)
        .all()
    )


def create_bill(db: Session, bill):
    total_amount = 0
    total_profit = 0
    bill_items = []

    for item in bill.items:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        if product.quantity_available < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.product_name}"
            )

        item_total = item.selling_price * item.quantity
        item_profit = (
            item.selling_price - product.cost_price
        ) * item.quantity

        product.quantity_available -= item.quantity

        bill_item = models.Bill(
            vendor_id=bill.vendor_id,
            product_id=item.product_id,
            quantity=item.quantity,
            cost_price=product.cost_price,
            selling_price=item.selling_price,
            profit=item_profit,
        )

        total_amount += item_total
        total_profit += item_profit

        bill_items.append({
            "product_name": product.product_name,
            "quantity": item.quantity,
            "price_per_unit": item.selling_price,
            "total": item_total
        })

        db.add(bill_item)

    db.commit()

    return {
        "items": bill_items,
        "grand_total": total_amount,
        "total_profit": total_profit
    }




# --------------------
# GEMINI AI
# --------------------

def build_marketing_prompt(analytics: dict) -> str:
    return f"""
You are a senior performance marketing strategist.

IMPORTANT:
- All monetary values are in INR (₹).
- Use the ₹ symbol when referring to money.

Rules:
- Use ONLY the provided data
- Do NOT invent numbers
- Be specific and actionable
- Avoid generic advice

Analytics data:
{json.dumps(analytics, indent=2)}

Return STRICT JSON:

{{
  "key_insights": [],
  "problems": [],
  "recommended_actions": [
    {{
      "priority": "HIGH | MEDIUM | LOW",
      "action": "",
      "reason": "",
      "metric_to_track": ""
    }}
  ],
  "budget_advice": ""
}}
"""

def generate_marketing_insights(ai_analytics: dict) -> str:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        build_marketing_prompt(ai_analytics),
        generation_config={"temperature": 0.4}
    )
    return response.text

def safe_parse_ai_response(text: str):
    try:
        cleaned = text.strip()

        # Remove markdown code fences if present
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        return json.loads(cleaned)

    except Exception:
        return {
            "error": "Invalid AI response",
            "raw": text
        }
