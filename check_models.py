import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# List available models
print("Available Models:")
for model in genai.list_models():
    print(f"- {model.name}")
    print(f"  Supported generation methods: {model.supported_generation_methods}")
    print() 