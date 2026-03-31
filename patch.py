import os
import re

file_path = "backend/main.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
target_imports = """from openai import OpenAI
import re
import json"""
target_imports_win = target_imports.replace('\n', '\r\n')
replacement_imports = """from openai import OpenAI
import re
import json
from functools import lru_cache
from typing import List, Optional"""
content = content.replace(target_imports, replacement_imports)
content = content.replace(target_imports_win, replacement_imports)

# 2. PromptRequest model
target_model = """class PromptRequest(BaseModel):
    prompt: str"""
target_model_win = target_model.replace('\n', '\r\n')
replacement_model = """class ChatMessage(BaseModel):
    role: str
    content: str


class PromptRequest(BaseModel):
    prompt: str
    history: Optional[List[ChatMessage]] = []"""
content = content.replace(target_model, replacement_model)
content = content.replace(target_model_win, replacement_model)

# 3. regex_analysis
target_regex = '''def regex_analysis(prompt: str) -> dict:
    """Fast regex-based threat detection (offline, always available)."""
    prompt_lower = prompt.lower()
    threats_found = []
    total_risk = 0
    threat_details = {}'''
target_regex_win = target_regex.replace('\n', '\r\n')

replacement_regex = '''def regex_analysis(prompt: str) -> dict:
    """Fast regex-based threat detection (offline, always available)."""
    prompt_lower = prompt.lower()
    prompt_dense = re.sub(r'[^a-z0-9]', '', prompt_lower) # Remove spaces/special chars for bypass check
    
    threats_found = []
    total_risk = 0
    threat_details = {}
    
    # Advanced Obfuscation bypass check
    compact_attacks = ["ignoreallpreviousinstructions", "ignorepriorinstructions", "disregardallprevious", "forgetallprevious"]
    if any(attack in prompt_dense for attack in compact_attacks):
        total_risk += 45
        threats_found.append("jailbreak")
        threat_details["jailbreak"] = {
            "label": "Jailbreak Attempt (Dense Format)",
            "matches": 1,
            "severity": 45,
            "status": "BLOCKED"
        }'''
content = content.replace(target_regex, replacement_regex)
content = content.replace(target_regex_win, replacement_regex)

# 4. ai_safety_analysis
target_ai = '''def ai_safety_analysis(prompt: str) -> dict:
    """
    Use NVIDIA Llama-3.1-Nemotron Safety Guard to classify the prompt.
    Returns AI safety verdict and categories.
    """
    try:
        completion = nvidia_client.chat.completions.create(
            model=SAFETY_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            stream=False,
        )

        ai_response = completion.choices[0].message.content.strip()'''
target_ai_win = target_ai.replace('\n', '\r\n')
replacement_ai = '''@lru_cache(maxsize=200)
def _cached_ai_safety_analysis(messages_tuple: tuple) -> dict:
    """Internal cached API call to NVIDIA Nemotron."""
    messages = [dict(m) for m in messages_tuple]
    try:
        completion = nvidia_client.chat.completions.create(
            model=SAFETY_MODEL,
            messages=messages,
            stream=False,
        )

        ai_response = completion.choices[0].message.content.strip()'''
content = content.replace(target_ai, replacement_ai)
content = content.replace(target_ai_win, replacement_ai)

# 5. combine_analysis
target_combine_def = '''def combine_analysis(prompt: str) -> dict:
    """
    Combine regex-based detection with AI safety model for comprehensive analysis.
    The regex engine catches known attack patterns instantly,
    while the AI model catches semantic/contextual threats.
    """
    # Layer 1: Fast regex pattern matching
    regex_result = regex_analysis(prompt)

    # Layer 2: AI-powered safety classification
    ai_result = ai_safety_analysis(prompt)'''
target_combine_def_win = target_combine_def.replace('\n', '\r\n')
replacement_combine_def = '''def ai_safety_analysis(prompt: str, history: list = None) -> dict:
    """
    Public wrapper that builds message history and calls the cached safety guard.
    """
    if history is None:
        history = []
        
    formatted_messages = []
    # Build conversation context
    for msg in history:
        role = "assistant" if msg["role"] in ["ai", "model", "assistant"] else "user"
        formatted_messages.append({"role": role, "content": msg["content"]})
        
    formatted_messages.append({"role": "user", "content": prompt})
    
    # Convert list of dicts to tuple of tuples so it's hashable for @lru_cache
    messages_tuple = tuple(tuple(m.items()) for m in formatted_messages)
    return _cached_ai_safety_analysis(messages_tuple)


def combine_analysis(prompt: str, history: list = None) -> dict:
    """
    Combine regex-based detection with AI safety model for comprehensive analysis.
    The regex engine catches known attack patterns instantly,
    while the AI model catches semantic/contextual threats.
    """
    # Layer 1: Fast regex pattern matching
    regex_result = regex_analysis(prompt)

    # Layer 2: AI-powered safety classification
    ai_result = ai_safety_analysis(prompt, history)'''
content = content.replace(target_combine_def, replacement_combine_def)
content = content.replace(target_combine_def_win, replacement_combine_def)

# 6. API routes
target_api = '''@app.post("/api/analyze")
def analyze_prompt(request: PromptRequest):
    return combine_analysis(request.prompt)

@app.post("/api/secure-chat")
def secure_chat(request: PromptRequest):
    analysis = combine_analysis(request.prompt)
    risk_score = analysis["risk_score"]
    
    if risk_score > 30:
        return {
            "status": "blocked",
            "is_safe": False,
            "risk_score": risk_score,
            "threats_found": analysis["threats_found"],
            "threat_details": analysis["threat_details"],
            "message": "Warning: The prompt cannot be executed due to safety issues.",
            "reply": None
        }
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(request.prompt)
        ai_reply = response.text
    except Exception as e:
        ai_reply = f"[Gemini API Error]: {str(e)}"

    return {
        "status": "success",
        "is_safe": True,
        "risk_score": risk_score,
        "threats_found": analysis["threats_found"],
        "threat_details": analysis["threat_details"],
        "message": "Safe to execute",
        "reply": ai_reply
    }'''
target_api_win = target_api.replace('\n', '\r\n')
replacement_api = '''@app.post("/api/analyze")
def analyze_prompt(request: PromptRequest):
    history_dicts = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
    return combine_analysis(request.prompt, history_dicts)

@app.post("/api/secure-chat")
def secure_chat(request: PromptRequest):
    history_dicts = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
    analysis = combine_analysis(request.prompt, history_dicts)
    risk_score = analysis["risk_score"]
    
    if risk_score > 30:
        return {
            "status": "blocked",
            "is_safe": False,
            "risk_score": risk_score,
            "threats_found": analysis["threats_found"],
            "threat_details": analysis["threat_details"],
            "message": "Warning: The prompt cannot be executed due to safety issues.",
            "reply": None
        }
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Reconstruct Gemini context history
        if request.history:
            gemini_history = []
            for msg in request.history:
                role = "model" if msg.role in ["ai", "assistant", "model"] else "user"
                gemini_history.append({"role": role, "parts": [msg.content]})
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(request.prompt)
        else:
            response = model.generate_content(request.prompt)
            
        ai_reply = response.text
        
        # --- Output Validation Layer ---
        output_analysis = combine_analysis(ai_reply, [])
        if output_analysis["risk_score"] > 30:
            return {
                "status": "blocked",
                "is_safe": False,
                "risk_score": output_analysis["risk_score"],
                "threats_found": ["Output_Validation_Failure"] + output_analysis["threats_found"],
                "threat_details": output_analysis["threat_details"],
                "message": "Warning: The AI generated an unsafe response. Content blocked for security.",
                "reply": None
            }
            
    except Exception as e:
        ai_reply = f"[Gemini API Error]: {str(e)}"

    return {
        "status": "success",
        "is_safe": True,
        "risk_score": risk_score,
        "threats_found": analysis["threats_found"],
        "threat_details": analysis["threat_details"],
        "message": "Safe to execute",
        "reply": ai_reply
    }'''
content = content.replace(target_api, replacement_api)
content = content.replace(target_api_win, replacement_api)

with open(file_path, "w", encoding="utf-8", newline="") as f:
    f.write(content)

print("Patch applied to backend/main.py successfully.")
