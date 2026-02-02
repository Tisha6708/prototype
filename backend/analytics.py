def generate_insights(products, bills):
    if not bills:
        return "No sales yet. Start selling to get insights."

    top_product = max(
        bills, key=lambda x: x["value"]
    )["name"]

    low_stock = [
        p.product_name for p in products if p.quantity_available < 5
    ]

    return f"""
Top selling product: {top_product}

Low stock products: {", ".join(low_stock) or "None"}

Suggestion:
Restock high-performing items and reduce focus on low-selling products.
"""
