import google.generativeai as genai

# Configure the API
genai.configure(api_key="AIzaSyBpRah5mKs45mEOIpGoFTKMQjHtgfIVD7g")

# List available models
print("Available Models:")
for model in genai.list_models():
    print(f"- {model.name}")
    print(f"  Supported generation methods: {model.supported_generation_methods}")
    print() 