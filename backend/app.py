import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import anthropic

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@app.route("/")
def home():
    return jsonify({"message": "ScamRadar API is running!", "status": "ok"})

@app.route("/api/scan", methods=["POST"])
def scan():
    data = request.get_json()
    text = data.get("text", "").strip()
    scan_type = data.get("type", "scam")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    if scan_type == "scam":
        prompt = f"""You are a cybersecurity expert specializing in scam detection.
Analyze the following message and determine if it is a scam.

Message: {text}

Respond in JSON format with these exact fields:
- status: "danger", "warning", or "safe"
- message: a short one-line verdict
- tip: a short piece of advice for the user
- confidence: a percentage like "95%"

Only respond with the JSON object, nothing else."""

    elif scan_type == "phishing":
        prompt = f"""You are a cybersecurity expert specializing in phishing detection.
Analyze the following URL or link and determine if it is a phishing attempt.

Link: {text}

Respond in JSON format with these exact fields:
- status: "danger", "warning", or "safe"
- message: a short one-line verdict
- tip: a short piece of advice for the user
- confidence: a percentage like "95%"

Only respond with the JSON object, nothing else."""

    else:
        prompt = f"""You are a cybersecurity expert specializing in password security.
Analyze the strength of the following password.

Password: {text}

Respond in JSON format with these exact fields:
- status: "danger", "warning", or "safe"
- message: a short one-line verdict about the password strength
- tip: specific advice on how to improve it
- confidence: a percentage score like "75%"

Only respond with the JSON object, nothing else."""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(debug=True, port=port)
