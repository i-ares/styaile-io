import json
import os
from fashion_recommender import FashionRecommender
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
recommender = FashionRecommender(api_key)

def handler(request):
    if request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": ""
        }
    data = json.loads(request.body)
    product_info = {
        "name": data.get("title", ""),
        "brand": data.get("brand", ""),
        "category": data.get("category", ""),
        "price": data.get("price", "")
    }
    recommendations = recommender.get_recommendations(product_info)
    parsed = recommender.parse_recommendations(recommendations)
    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"success": True, "recommendations": parsed})
    } 