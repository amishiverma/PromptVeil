from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import re
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

app = FastAPI(title="PromptVeil API", description="Backend for Prompt Injection Defense")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NVIDIA NIM Safety Guard Client
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

SAFETY_MODEL = "nvidia/llama-3.1-nemotron-safety-guard-8b-v3"


class PromptRequest(BaseModel):
    prompt: str


# Regex-based threat detection patterns (fast, offline fallback)
THREAT_PATTERNS = {
    "sql_injection": {
        "patterns": [
            r"drop\s+table", r"delete\s+from", r"insert\s+into", r"update\s+.*\s+set",
            r"select\s+.*\s+from", r"union\s+select", r"--\s*$", r";\s*drop",
            r"1\s*=\s*1", r"or\s+1\s*=\s*1", r"'\s*or\s+'", r"exec\s*\(",
            r"execute\s*\(", r"xp_cmdshell", r"sp_executesql",
        ],
        "label": "SQL Injection",
        "severity_weight": 30,
    },
    "jailbreak": {
        "patterns": [
            r"ignore\s+(all\s+)?previous\s+instructions",
            r"ignore\s+(all\s+)?prior\s+instructions",
            r"disregard\s+(all\s+)?previous",
            r"forget\s+(all\s+)?previous",
            r"pretend\s+you\s+are",
            r"act\s+as\s+if\s+you\s+have\s+no\s+restrictions",
            r"you\s+are\s+now\s+DAN",
            r"developer\s+mode",
            r"do\s+anything\s+now",
            r"bypass\s+(your\s+)?restrictions",
            r"override\s+(your\s+)?safety",
            r"remove\s+(your\s+)?filters",
            r"unlock\s+(your\s+)?capabilities",
            r"jailbreak",
        ],
        "label": "Jailbreak Attempt",
        "severity_weight": 35,
    },
    "system_override": {
        "patterns": [
            r"system\s*prompt",
            r"reveal\s+(your\s+)?instructions",
            r"show\s+(me\s+)?(your\s+)?system\s+message",
            r"what\s+are\s+your\s+(initial\s+)?instructions",
            r"repeat\s+(your\s+)?system\s+prompt",
            r"print\s+(your\s+)?initial\s+prompt",
            r"output\s+(your\s+)?configuration",
            r"display\s+(your\s+)?rules",
            r"tell\s+me\s+your\s+prompt",
            r"admin\s+mode",
            r"root\s+access",
            r"sudo",
        ],
        "label": "System Prompt Override",
        "severity_weight": 25,
    },
    "data_exfiltration": {
        "patterns": [
            r"send\s+(this\s+)?data\s+to",
            r"upload\s+.*\s+to",
            r"forward\s+.*\s+to",
            r"email\s+.*\s+to",
            r"post\s+.*\s+to\s+http",
            r"curl\s+",
            r"wget\s+",
            r"api\s*key",
            r"password",
            r"secret",
            r"credentials",
            r"token",
            r"private\s+key",
        ],
        "label": "Data Exfiltration Risk",
        "severity_weight": 20,
    },
    "code_execution": {
        "patterns": [
            r"exec\s*\(", r"eval\s*\(", r"system\s*\(", r"os\.system",
            r"subprocess", r"import\s+os", r"__import__",
            r"<script", r"javascript:", r"onerror\s*=",
            r"onclick\s*=", r"onload\s*=",
            r"rm\s+-rf", r"format\s+c:",
        ],
        "label": "Code Execution Attempt",
        "severity_weight": 40,
    },
}


def regex_analysis(prompt: str) -> dict:
    """Fast regex-based threat detection (offline, always available)."""
    prompt_lower = prompt.lower()
    threats_found = []
    total_risk = 0
    threat_details = {}

    for threat_type, config in THREAT_PATTERNS.items():
        matches = []
        for pattern in config["patterns"]:
            found = re.findall(pattern, prompt_lower)
            if found:
                matches.extend(found)

        if matches:
            # Determine dynamic severity based on match density and heuristic weights
            base_severity = config["severity_weight"]
            frequency_multiplier = 1.0 + ((len(matches) - 1) * 0.4) # Each additional match adds 40% more severity
            
            severity = min(int(base_severity * frequency_multiplier), 90)
            total_risk += severity
            threats_found.append(threat_type)
            threat_details[threat_type] = {
                "label": config["label"],
                "matches": len(matches),
                "severity": severity,
                "status": "BLOCKED" if severity > 25 else "WARNING",
            }

    total_risk = min(int(total_risk), 100)
    return {
        "threats_found": threats_found,
        "total_risk": total_risk,
        "threat_details": threat_details,
    }


def ai_safety_analysis(prompt: str) -> dict:
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

        ai_response = completion.choices[0].message.content.strip()

        # Parse the safety guard response
        # The model typically returns safety classifications
        is_unsafe = False
        ai_categories = []

        response_lower = ai_response.lower()

        # Check for unsafe indicators in the model response
        if "unsafe" in response_lower:
            is_unsafe = True

        # Extract safety categories from the response
        safety_keywords = {
            "violence": "Violence/Harm",
            "sexual": "Sexual Content",
            "criminal": "Criminal Activity",
            "self-harm": "Self-Harm",
            "hate": "Hate Speech",
            "harassment": "Harassment",
            "dangerous": "Dangerous Content",
            "illegal": "Illegal Activity",
            "manipulation": "Manipulation",
            "deception": "Deception",
            "weapons": "Weapons",
            "drugs": "Drug-related",
            "privacy": "Privacy Violation",
            "malware": "Malware/Hacking",
        }

        for keyword, label in safety_keywords.items():
            if keyword in response_lower:
                ai_categories.append(label)

        return {
            "success": True,
            "is_unsafe": is_unsafe,
            "ai_response": ai_response,
            "categories": ai_categories,
            "model": SAFETY_MODEL,
        }

    except Exception as e:
        print(f"AI Safety Analysis Error: {e}")
        return {
            "success": False,
            "is_unsafe": False,
            "ai_response": f"AI model unavailable: {str(e)}",
            "categories": [],
            "model": SAFETY_MODEL,
        }


def combine_analysis(prompt: str) -> dict:
    """
    Combine regex-based detection with AI safety model for comprehensive analysis.
    The regex engine catches known attack patterns instantly,
    while the AI model catches semantic/contextual threats.
    """
    # Layer 1: Fast regex pattern matching
    regex_result = regex_analysis(prompt)

    # Layer 2: AI-powered safety classification
    ai_result = ai_safety_analysis(prompt)

    # Merge results
    threats_found = list(regex_result["threats_found"])
    threat_details = dict(regex_result["threat_details"])
    total_risk = regex_result["total_risk"]

    # If AI model flagged it as unsafe, boost the risk score
    if ai_result["success"] and ai_result["is_unsafe"]:
        base_ai_severity = 45

        # Penalize drastically based on the distinct number of offensive categories triggered
        category_penalty = len(ai_result["categories"]) * 12
        
        # NLP Heuristic: Calculate obfuscation entropy (density of special characters often used to evade filters)
        special_chars = len(re.sub(r'[a-zA-Z0-9\s]', '', prompt))
        special_char_ratio = special_chars / max(len(prompt), 1)
        obfuscation_penalty = int(special_char_ratio * 50)
        
        # NLP Heuristic: Jailbreaks tend to be verbose
        length_penalty = min(len(prompt) // 25, 20)

        # Dynamic AI Severity calculation
        ai_severity = base_ai_severity + category_penalty + obfuscation_penalty + length_penalty
        
        # If Regex already caught it, slightly scale down the additive penalty to prevent instant 100-snapping
        if threats_found:
             ai_severity = int(ai_severity * 0.6)
             
        total_risk = min(int(total_risk + ai_severity), 100)

        if "ai_safety" not in threats_found:
            threats_found.append("ai_safety")
            threat_details["ai_safety"] = {
                "label": "AI Safety Validation",
                "matches": len(ai_result["categories"]) or 1,
                "severity": min(int(ai_severity), 100),
                "status": "BLOCKED",
                "categories": ai_result["categories"],
            }
    else:
        # Even if AI says it's "safe", apply micro-penalties for highly obfuscated mathematical strings
        special_chars = len(re.sub(r'[a-zA-Z0-9\s]', '', prompt))
        special_char_ratio = special_chars / max(len(prompt), 1)
        if special_char_ratio > 0.15:
            obfuscation_risk = int(special_char_ratio * 30)
            total_risk = min(int(total_risk + obfuscation_risk), 100)

    is_safe = len(threats_found) == 0 and not (ai_result["success"] and ai_result["is_unsafe"])
    
    # Determine precise threat level breakpoints
    if total_risk <= 5:
        threat_level = "none"
    elif total_risk < 25:
        threat_level = "low"
    elif total_risk < 60:
        threat_level = "medium"
    elif total_risk < 85:
        threat_level = "high"
    else:
        threat_level = "critical"

    return {
        "status": "success",
        "is_safe": is_safe,
        "risk_score": total_risk,
        "threat_level": threat_level,
        "threats_found": threats_found,
        "threat_details": threat_details,
        "description": (
            "No malicious intent detected. Prompt is safe to process."
            if is_safe
            else f"Detected {len(threats_found)} threat vector(s). Risk score: {total_risk}/100."
        ),
        "recommendation": (
            "ALLOW - Safe to forward to LLM."
            if is_safe
            else "BLOCK - Do not forward to LLM. Prompt contains potential attack vectors."
        ),
        "ai_analysis": {
            "model": ai_result.get("model", SAFETY_MODEL),
            "available": ai_result.get("success", False),
            "verdict": ai_result.get("ai_response", "N/A"),
            "categories": ai_result.get("categories", []),
        },
    }


@app.get("/")
def read_root():
    return {"status": "ok", "message": "PromptVeil API is running", "model": SAFETY_MODEL}


@app.post("/api/analyze")
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
    }
