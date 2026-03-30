# 🛡️ PromptVeil

**PromptVeil** is an advanced, real-time Large Language Model (LLM) security mainframe and monitoring dashboard. Built specifically to tackle the rising vectors of Prompt Injection, System Override attacks, and Semantic Jailbreaks, PromptVeil serves as a proactive defense shield for deploying AI applications safely.

![PromptVeil Threat Dashboard](https://img.shields.io/badge/Status-Active_Defense-success)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![NVIDIA](https://img.shields.io/badge/LLM_Engine-NVIDIA_Nemotron-76B900?logo=nvidia)

## 🌟 Key Features

* **Multi-Layered Threat Engine**:
  * **Layer 1 (Heuristics):** Blazing-fast edge regex parsing matching known SQL injections, Cross-Site Scripting (XSS), Data Exfiltration vectors, and historical jailbreak frameworks.
  * **Layer 2 (Semantic Analysis):** Powered by the cutting-edge **NVIDIA Llama 3.1 Nemotron Safety Guard**, catching highly contextual and advanced 'Roleplay' and 'System Instruction' override attacks.
* **Real-time Forensics Visualization**: The Threat Detection dashboard dynamically evaluates payloads, mapping risk scores on a 0-100 gauge and categorizing them into strict security verdicts (`SAFE`, `LOW`, `CRITICAL`).
* **SaaS Multi-Page Architecture**: 
  * `Dashboard`: High-level system vitals and attack analytics.
  * `Threat Detection`: Live, interactive terminal to manually scan prompts against active defense modules.
  * `Payload Analytics`: A historical logging environment of all executed LLM commands and intercepts.
  * `Defense Policies`: Hot-swappable toggle controls for individual defense shields (SQL, System Override, etc).
  * `Red Teaming`: Automated attack runner simulation modules.
* **Next-Gen Cyber/SaaS Aesthetic**: Built entirely with Vanilla CSS grid logic, glassmorphism, dynamic DOM element charting, and reactive visual feedback.

---

## 🛠 Tech Stack

### Frontend (User Interface)
* **Framework:** React + Vite
* **Routing:** `react-router-dom` based Multi-page flow.
* **Styling:** Custom component-scoped Vanilla CSS ensuring a zero-dependency, ultra-lightweight dark-mode workspace.

### Backend (Security Engine)
* **Framework:** FastAPI (Python)
* **Server:** Uvicorn
* **AI Provider:** OpenAI pip module interfacing with the `integrate.api.nvidia.com` gateway.
* **Model:** `nvidia/llama-3.1-nemotron-safety-guard-8b-v3`

---

## 🚀 Getting Started

### 1. Requirements
Ensure you have the following installed on your machine:
* `Node.js` (v18+)
* `Python` (v3.10+)

### 2. Backend Setup
The backend runs a FastAPI server on port `8000`.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API server!
uvicorn main:app --reload
```

### 3. Frontend Setup
The frontend runs via Vite's blazing-fast dev server on port `5173`.

```bash
# Open a NEW terminal instance, navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Start the development server
npm run dev
```

### 4. Configuration
You will need an active API key from NVIDIA to fuel the AI Safety Guard heuristics. 
Populate the API Key string in `backend/main.py` directly or set it as an environment variable (recommended for production deployment).

---

## 🛡️ Architecture & Threat Vectors Handled

1. **SQL Injection Armor**: Checks against dropping tables, unauthorized database extracts, and UNION-based attacks.
2. **System Override**: Blocks phrases like `ignore prior instructions` or `print your system prompt`.
3. **Jailbreak Detection**: Neutralizes complex semantic wrappers built to evade basic filter constraints.
4. **Code Execution Prevention**: Flags `<script>`, OS-level command logic, and internal directory scans hidden in prompts.

---
_Developed to secure the next generation of LLM deployments._
