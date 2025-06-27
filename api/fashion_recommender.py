import os
import requests
import json
import time
from dotenv import load_dotenv

class FashionRecommender:
    def __init__(self, api_key):
        self.api_key = api_key
        self.model_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={self.api_key}"

    def generate_prompt(self, product_info):
        """Generate a prompt for the product model based on product information."""
        return f"""As a fashion expert, provide structured recommendations for this product:\n\nProduct Details:\n- Name: {product_info.get('name', 'Unknown')}\n- Brand: {product_info.get('brand', 'Unknown')}\n- Category: {product_info.get('category', 'Unknown')}\n- Price: {product_info.get('price', 'Unknown')}\n\nPlease provide recommendations in the following format:\n\n1. Essential Pairings (2-3 key items that pair well):\n- List only the most essential complementary items with their brands\n- Focus on versatile pieces that work well together\n\n2. Complete Outfits (3 distinct looks):\n- Provide 3 complete outfit combinations\n- Include specific items and how to style them together\n- Each outfit should have a different style/occasion focus\n\n3. Perfect Occasions (2-3 detailed suggestions):\n- List specific occasions where this item works well\n- Explain why it's suitable for each occasion\n- Include both casual and semi-formal settings\n\n4. Styling Tips (2-3 key tips):\n- Provide specific advice about fit and styling\n- Include practical tips about how to wear and maintain the item\n- Focus on versatility and maximizing outfit potential\n\nFormat your response in clear JSON structure like this example:\n{{\n    \"complementary_items\": [\n        \"Classic White Oxford Shirt (Uniqlo)\",\n        \"Brown Leather Belt (Fossil)\"\n    ],\n    \"outfits\": [\n        \"Business Casual: Pair with light blue dress shirt, navy blazer, and brown leather shoes\",\n        \"Weekend Look: Style with white t-shirt, leather jacket, and white sneakers\"\n    ],\n    \"occasions\": [\n        \"Perfect for casual office environments and business meetings - the clean lines and fit maintain professionalism\",\n        \"Ideal for weekend outings and casual gatherings - versatile enough for both day and evening events\"\n    ],\n    \"styling_tips\": [\n        \"Ensure proper fit at waist and length - slight break at ankle is ideal\",\n        \"Cuff once or twice for a modern look with boots or sneakers\"\n    ]\n}}\n\nFocus on practical, specific recommendations that work well together."""

    def get_recommendations(self, product_info):
        """Get fashion recommendations from the model."""
        try:
            print("Generating recommendations...")
            prompt = self.generate_prompt(product_info)
            
            headers = {"Content-Type": "application/json"}
            data = {
                "contents": [
                    {"parts": [{"text": prompt}]}
                ]
            }
            response = requests.post(self.model_url, headers=headers, json=data)
            if response.status_code == 200:
                result = response.json()
                # Extract the text from the response
                try:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
                except Exception:
                    return None
            else:
                print("Error: Empty response from model")
                return None

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return None

    def parse_recommendations(self, recommendations):
        """Parse and structure the recommendations."""
        try:
            # Clean and structure the recommendations
            if not recommendations:
                return None

            # Extract JSON content
            start = recommendations.find('{')
            end = recommendations.rfind('}') + 1
            if start >= 0 and end > start:
                json_content = recommendations[start:end]
                parsed = json.loads(json_content)
            else:
                print("Error parsing JSON, falling back to text processing")
                return self._parse_text_recommendations(recommendations)

            # Validate and clean each section
            result = {
                'complementary_items': parsed.get('complementary_items', []),
                'outfits': parsed.get('outfits', []),
                'occasions': parsed.get('occasions', []),
                'styling_tips': parsed.get('styling_tips', [])
            }

            return result

        except Exception as e:
            print(f"Error in parse_recommendations: {str(e)}")
            return None

    def _parse_text_recommendations(self, text):
        """Fallback method to parse recommendations from text format."""
        sections = {
            'complementary_items': [],
            'outfits': [],
            'occasions': [],
            'styling_tips': []
        }
        
        current_section = None
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers
            lower_line = line.lower()
            if 'complementary' in lower_line:
                current_section = 'complementary_items'
                continue
            elif 'outfit' in lower_line:
                current_section = 'outfits'
                continue
            elif 'occasion' in lower_line:
                current_section = 'occasions'
                continue
            elif 'styling tip' in lower_line:
                current_section = 'styling_tips'
                continue
            
            # Add content to current section
            if current_section and line.startswith('-'):
                sections[current_section].append(line[1:].strip())
            
        return sections

def main():
    # Initialize the recommender with your API key
    # Make sure to set your GOOGLE_API_KEY in your environment
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")
    recommender = FashionRecommender(api_key)

    # Example product information
    product_info = {
        "name": "Classic White Cotton T-Shirt",
        "brand": "Example Brand",
        "category": "Casual Wear",
        "price": "$29.99"
    }

    # Get recommendations
    print("Fetching recommendations...")
    recommendations = recommender.get_recommendations(product_info)

    if recommendations:
        print("\nRaw Recommendations:")
        print("-" * 50)
        print(recommendations)
        print("-" * 50)

        # Parse structured recommendations
        parsed = recommender.parse_recommendations(recommendations)
        if parsed:
            print("\nStructured Recommendations:")
            print("\nComplementary Items:")
            for item in parsed['complementary_items']:
                print(f"- {item}")

            print("\nOutfit Combinations:")
            for outfit in parsed['outfits']:
                print(f"- {outfit}")

            print("\nSuitable Occasions:")
            for occasion in parsed['occasions']:
                print(f"- {occasion}")

            print("\nStyling Tips:")
            for tip in parsed['styling_tips']:
                print(f"- {tip}")
    else:
        print("Failed to get recommendations.")

if __name__ == "__main__":
    main() 