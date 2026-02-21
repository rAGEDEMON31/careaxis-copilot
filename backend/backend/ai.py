import json
import os
from typing import Any, Dict, List

import cohere
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("COHERE_MODEL", "command-a-03-2025")
PROMPT_CONTEXT = os.getenv(
    "AI_PROMPT_CONTEXT",
    (
        "You are CareAxis clinical co-pilot. "
        "Give concise, safety-first triage guidance for doctors."
    ),
)


def _history_to_text(history: List[Dict[str, Any]]) -> str:
    if not history:
        return "No prior AI analysis history available for this patient."

    lines = []
    for idx, entry in enumerate(history, start=1):
        causes = entry.get("probable_causes", [])
        if isinstance(causes, list):
            causes_text = ", ".join(str(c) for c in causes) if causes else "None"
        else:
            causes_text = str(causes)

        lines.append(
            f"{idx}. risk_level={entry.get('risk_level', 'unknown')}, "
            f"probable_causes={causes_text}, "
            f"specialist_recommendation={entry.get('specialist_recommendation', 'N/A')}"
        )

    return "\n".join(lines)


def build_analysis_prompt(payload: Dict[str, Any], history: List[Dict[str, Any]]) -> str:
    history_text = _history_to_text(history)
    current_case = json.dumps(payload, indent=2, default=str)

    return (
        f"Context:\n{PROMPT_CONTEXT}\n\n"
        "You are a clinical decision-support assistant for emergency triage.\n"
        "Use both the current case data and prior patient history to estimate likely causes,\n"
        "risk level, specialist recommendation, and a concise summary.\n\n"
        f"Current Case:\n{current_case}\n\n"
        f"Prior History (latest first):\n{history_text}\n\n"
        "Return strictly valid JSON only (no markdown, no extra text) with keys:\n"
        "- probable_causes: array of strings\n"
        "- risk_level: string\n"
        "- specialist_recommendation: string\n"
        "- summary: string\n"
        "- confidence_score: number between 0 and 1"
    )


def _extract_text_from_response(response: Any) -> str:
    message = getattr(response, "message", None)
    if message is None:
        raise ValueError("Cohere response missing 'message' field")

    content = getattr(message, "content", None)
    if not content:
        raise ValueError("Cohere response message is empty")

    chunks: List[str] = []
    for item in content:
        text = getattr(item, "text", None)
        if text:
            chunks.append(text)
            continue
        if isinstance(item, dict) and item.get("text"):
            chunks.append(str(item["text"]))

    combined = "\n".join(chunk.strip() for chunk in chunks if chunk.strip())
    if not combined:
        raise ValueError("No text content returned by Cohere")
    return combined


def _extract_json_object(text: str) -> Dict[str, Any]:
    text = text.strip()

    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    for idx, char in enumerate(text):
        if char != "{":
            continue
        try:
            parsed, _ = decoder.raw_decode(text[idx:])
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            continue

    raise ValueError("Model did not return a valid JSON object")


def _validate_analysis_output(data: Dict[str, Any]) -> Dict[str, Any]:
    required_fields = [
        "probable_causes",
        "risk_level",
        "specialist_recommendation",
        "summary",
        "confidence_score",
    ]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise ValueError(f"Missing required fields in model output: {missing}")

    probable_causes = data["probable_causes"]
    if not isinstance(probable_causes, list):
        raise ValueError("probable_causes must be a list")
    probable_causes = [str(item) for item in probable_causes]

    risk_level = str(data["risk_level"])
    specialist_recommendation = str(data["specialist_recommendation"])
    summary = str(data["summary"])

    try:
        confidence_score = float(data["confidence_score"])
    except (TypeError, ValueError) as exc:
        raise ValueError("confidence_score must be a number") from exc

    if confidence_score < 0 or confidence_score > 1:
        raise ValueError("confidence_score must be between 0 and 1")

    return {
        "probable_causes": probable_causes,
        "risk_level": risk_level,
        "specialist_recommendation": specialist_recommendation,
        "summary": summary,
        "confidence_score": confidence_score,
    }


def analyze_case(payload: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        raise RuntimeError("COHERE_API_KEY is not set in environment")

    prompt = build_analysis_prompt(payload, history)

    client = cohere.ClientV2(api_key)
    response = client.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    output_text = _extract_text_from_response(response)
    parsed = _extract_json_object(output_text)
    return _validate_analysis_output(parsed)
