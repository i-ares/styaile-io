import google.generativeai as genai
import json
import time

class FashionRecommender:
    def __init__(self, api_key):
        self.api_key = api_key
        genai.configure(api_key=api_key)
        # Configure safety settings
        safety_settings = {
            "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
            "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
            "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
            "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
        }
        # Use the latest stable model
        self.model = genai.GenerativeModel('models/gemma-3-27b-it', safety_settings=safety_settings)

    def generate_prompt(self, product_info):
        """Generate a prompt for the product model based on product information."""
        return f"""As a fashion expert, provide structured recommendations for this product:

Product Details:
- Name: {product_info.get('name', 'Unknown')}
- Brand: {product_info.get('brand', 'Unknown')}
- Category: {product_info.get('category', 'Unknown')}
- Price: {product_info.get('price', 'Unknown')}

Please provide recommendations in the following format:

1. Essential Pairings (2-3 key items that pair well):
- List only the most essential complementary items with their brands
- Focus on versatile pieces that work well together

2. Complete Outfits (3 distinct looks):
- Provide 3 complete outfit combinations
- Include specific items and how to style them together
- Each outfit should have a different style/occasion focus

3. Perfect Occasions (2-3 detailed suggestions):
- List specific occasions where this item works well
- Explain why it's suitable for each occasion
- Include both casual and semi-formal settings

4. Styling Tips (2-3 key tips):
- Provide specific advice about fit and styling
- Include practical tips about how to wear and maintain the item
- Focus on versatility and maximizing outfit potential

Format your response in clear JSON structure like this example:
{{
    "complementary_items": [
        "Classic White Oxford Shirt (Uniqlo)",
        "Brown Leather Belt (Fossil)"
    ],
    "outfits": [
        "Business Casual: Pair with light blue dress shirt, navy blazer, and brown leather shoes",
        "Weekend Look: Style with white t-shirt, leather jacket, and white sneakers"
    ],
    "occasions": [
        "Perfect for casual office environments and business meetings - the clean lines and fit maintain professionalism",
        "Ideal for weekend outings and casual gatherings - versatile enough for both day and evening events"
    ],
    "styling_tips": [
        "Ensure proper fit at waist and length - slight break at ankle is ideal",
        "Cuff once or twice for a modern look with boots or sneakers"
    ]
}}

Focus on practical, specific recommendations that work well together."""

    def get_recommendations(self, product_info):
        """Get fashion recommendations from the model."""
        try:
            print("Generating recommendations...")
            prompt = self.generate_prompt(product_info)
            
            # Generate response from Gemini
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'max_output_tokens': 1200,
                }
            )

            if response.text:
                return response.text
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
            try:
                import json
                # Find JSON-like content between curly braces
                start = recommendations.find('{')
                end = recommendations.rfind('}') + 1
                if start >= 0 and end > start:
                    json_content = recommendations[start:end]
                    parsed = json.loads(json_content)
                else:
                    raise ValueError("No JSON content found")
            except json.JSONDecodeError:
                print("Error parsing JSON, falling back to text processing")
                return self._parse_text_recommendations(recommendations)

            # Validate and clean each section
            result = {
                'complementary_items': [],
                'outfits': [],
                'occasions': [],
                'styling_tips': []
            }

            # Process complementary items (limit to 3)
            if 'complementary_items' in parsed:
                items = parsed['complementary_items']
                result['complementary_items'] = [
                    item.strip() for item in items[:3]
                    if isinstance(item, str) and item.strip()
                ]

            # Process outfits (ensure 3 complete outfits)
            if 'outfits' in parsed:
                outfits = parsed['outfits']
                result['outfits'] = [
                    outfit.strip() for outfit in outfits
                    if isinstance(outfit, str) and outfit.strip()
                ]
                # Add default outfits if needed
                while len(result['outfits']) < 3:
                    result['outfits'].append(
                        "Classic casual: Pair with a white t-shirt, denim jacket, and white sneakers"
                    )

            # Process occasions (ensure 2-3 detailed suggestions)
            if 'occasions' in parsed:
                occasions = parsed['occasions']
                result['occasions'] = [
                    occasion.strip() for occasion in occasions
                    if isinstance(occasion, str) and occasion.strip()
                ]
                # Add default occasions if needed
                if not result['occasions']:
                    result['occasions'] = [
                        "Perfect for casual office environments and weekend outings - versatile enough for both settings",
                        "Ideal for social gatherings and casual dates - strikes the right balance of style and comfort"
                    ]

            # Process styling tips
            if 'styling_tips' in parsed:
                tips = parsed['styling_tips']
                result['styling_tips'] = [
                    tip.strip() for tip in tips
                    if isinstance(tip, str) and tip.strip()
                ]

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
    api_key = "AIzaSyBpRah5mKs45mEOIpGoFTKMQjHtgfIVD7g"
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