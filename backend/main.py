from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PromptVeil API", description="Backend for Prompt Injection Defense")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PromptVeil API is running"}

@app.post("/api/analyze")
def analyze_prompt(request: PromptRequest):
    # TODO: Integrate LLM security analysis logic here
    # Placeholder response
    is_safe = "drop table" not in request.prompt.lower()
    return {
        "status": "success",
        "is_safe": is_safe,
        "threat_level": "low" if is_safe else "high",
        "description": "No malicious intent detected." if is_safe else "Potential SQL Injection detected."
    }
