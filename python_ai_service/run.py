#!/usr/bin/env python3
"""
AI Fashion Assistant Python Service Runner
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing Python dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def run_service():
    """Run the AI service"""
    print("🚀 Starting AI Fashion Assistant Python Service...")
    print("🤖 Using Qwen/Qwen2.5-32B-Instruct model via Hugging Face API")
    print("🔗 Service will be available at http://localhost:5000")
    
    # Set environment variables
    os.environ['FLASK_APP'] = 'main.py'
    os.environ['FLASK_ENV'] = 'development'
    
    # Run the Flask app
    subprocess.run([sys.executable, "main.py"])

if __name__ == "__main__":
    try:
        install_requirements()
        run_service()
    except KeyboardInterrupt:
        print("\n👋 AI Fashion Assistant service stopped")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)