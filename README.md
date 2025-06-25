# Styaile.io

<img width="310" alt="image" src="https://github.com/user-attachments/assets/bbad0665-fb7f-424d-9c26-35b1071572eb" />


## Overview

Styaile.io is a sophisticated, AI-powered fashion recommendation platform designed to provide a serene and editorial experience for discovering personal style. It combines intelligent outfit suggestions with a calm, minimalist user interface, allowing users to focus on finding fashion that truly represents them. The project includes a web application, a Python-based AI backend, and a companion Chrome Extension for seamless integration into the user's browsing experience.

---

## Features

- **AI-Powered Recommendations**: Utilizes a Python backend to provide intelligent and personalized fashion recommendations using Generative AI for current and upcoming trends.
- **Interactive Chat Interface**: A sleek, modal-based chat for receiving style advice and product suggestions.
- **"Looks" Questionnaire**: A multi-step questionnaire to generate a curated, personalized outfit prompt.
- **Elegant & Minimalist UI**: A fully responsive design inspired by high-fashion editorial layouts, featuring a custom "Streamster" font for branding and "Inter" for body text.
- **Dark/Light Mode**: A seamless theme-switching experience for user comfort.
- **Full-Screen Hero Carousel**: An immersive hero section with a carousel of text and high-fashion imagery.
- **Companion Chrome Extension**: For providing fashion insights on the go (initial implementation).
- **Proprietary Codebase**: All rights reserved by the developer.

---

## Tech Stack

**Frontend:**
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Language**: TypeScript

**Backend:**
- **Framework**: Flask
- **Language**: Python
- **Dependencies**:
  - `Flask-CORS` for handling Cross-Origin Resource Sharing.
  - `requests` for making HTTP requests.
  - `python-dotenv` for managing environment variables.

**Chrome Extension:**
- Built with HTML, CSS, and JavaScript, integrated into the Vite build process.

---

## Project Structure

The project is organized into three main parts:

- `src/`: Contains the source code for the React frontend application, including components, services, and styles.
- `python_ai_service/`: Contains the Flask-based Python backend for the AI recommendation engine.
- `public/`: Contains the files for the Chrome Extension as well as static assets like fonts and images.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Python](https://www.python.org/) (v3.9 or later recommended) and `pip`

### 1. Backend Setup

Next, set up and run the Python backend service in a separate terminal.

```bash
# Navigate to the project directory
cd styaile-io

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt

# Run the Flask server
python server.py
```
The backend API will be running on `http://localhost:5000`.

### 2. Frontend Setup

First, navigate to the project root and set up the React application.

```bash
# Install all the required npm packages
npm install

# Run the frontend development server
npm run dev
```
The application should now be running on `http://localhost:3000` (or another port if 3000 is busy).


### 3. Chrome Extension Setup

To use the companion extension:

1.  Run the extension-specific build command:
    ```bash
    npm run build:extension
    ```
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" in the top right corner.
4.  Click "Load unpacked" and select the `public` directory that was generated in the project root.
5.  The Styaile.io extension should now be active in your browser.

---

## Copyright and License

© 2024 Soham Bhar (i-ares). All Rights Reserved.

This project and its source code are the proprietary intellectual property of Soham Bhar (i-ares). Unauthorized use, reproduction, modification, distribution, or publication of this code, in whole or in part, is strictly prohibited. You are not permitted to use this code for any commercial or non-commercial purposes, publish it, or claim it as your own.

This notice must be included in all copies or substantial portions of the software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
