from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas import BillCreate
import models, schemas, crud
from db import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from analytics import generate_insights
from sqlalchemy import text

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

# -------- PRODUCTS --------
@app.post("/products", response_model=schemas.ProductOut)
def add_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    return crud.create_product(db, product)


@app.get("/products")
def get_products(vendor_id: int, db: Session = Depends(get_db)):
    return crud.get_products(db, vendor_id)


# -------- BILLS --------
@app.post("/bills")
def create_bill(
    bill: BillCreate,
    db: Session = Depends(get_db)
):
    return crud.create_bill(db, bill)

@app.post("/bills", response_model=schemas.BillOut)
def generate_bill(
    bill: schemas.BillCreate,
    db: Session = Depends(get_db)
):
    return crud.create_bill(db, bill)



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

    if not sales:
        insight = "No sales yet. Generate bills to unlock insights."
    else:
        top = max(sales, key=lambda x: x["quantity"])
        least = min(sales, key=lambda x: x["quantity"])
        loss_items = [s for s in sales if s["profit"] < 0]

        insight = f"""
Top selling product: {top['name']} ({top['quantity']} units)
Least selling product: {least['name']} ({least['quantity']} units)

Revenue: ₹{total_revenue}
Cost: ₹{total_cost}
Profit: ₹{total_profit}

Suggestions:
- Restock high-performing products
- Improve pricing or promotions for slow sellers
""".strip()

        if loss_items:
            insight += "\n⚠ Some products are selling at a loss."

    return {
        "kpis": {
            "total_revenue": total_revenue,
            "total_cost": total_cost,
            "total_profit": total_profit,
            "total_units_sold": total_units,
            "product_count": len(sales),
        },
        "sales": sales,
        "insight": insight,
    }
