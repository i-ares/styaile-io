from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from fashion_recommender import FashionRecommender
import json
import traceback
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Configure CORS with more specific settings
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize the fashion recommender
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment. Please set it in your .env file.")
recommender = FashionRecommender(api_key)

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Server is working!"})

@app.route('/', methods=['GET', 'OPTIONS'])
def health_check():
    response = jsonify({"status": "ok", "message": "Fashion recommendation server is running"})
    # Add CORS headers explicitly
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response

@app.route('/get_recommendations', methods=['POST', 'OPTIONS'])
def get_recommendations():
    try:
        # Log the incoming request
        print("Received request with headers:", dict(request.headers))
        print("Received request body:", request.get_data(as_text=True))
        
        if request.method == 'OPTIONS':
            response = make_response()
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
            return response

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        product_info = {
            "name": data.get("title", ""),
            "brand": data.get("brand", ""),
            "category": data.get("category", ""),
            "price": data.get("price", "")
        }

        # Validate required fields
        if not product_info["name"]:
            return jsonify({"success": False, "error": "Product title is required"}), 400

        # Get recommendations
        print("Getting recommendations for:", product_info)
        recommendations = recommender.get_recommendations(product_info)
        
        if recommendations:
            # Parse recommendations
            parsed = recommender.parse_recommendations(recommendations)
            print("Generated recommendations:", parsed)
            response = jsonify({"success": True, "recommendations": parsed})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({"success": False, "error": "Failed to get recommendations"})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500

    except Exception as e:
        print("Error occurred:", str(e))
        print("Traceback:", traceback.format_exc())
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

if __name__ == '__main__':
    # Enable debug mode and allow external access
    app.run(host='0.0.0.0', port=5000, debug=True) 