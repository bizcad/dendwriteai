# AI Question Type Inference System for QuestionManager

## Overview

This document outlines a system to automatically infer question metadata from question text using AI analysis. Instead of manually specifying types, a client provides only question text, and the system generates:

- **SqlDataType** (nvarchar, bit, datetime, etc.)
- **PocoType** (string, bool, DateTime, etc.)
- **DisplayType** (email, password, text, boolean, select, etc.)
- **ValidationRules** (regex, required, format constraints)
- **Topic** (inferred grouping)
- **TabName** (UI section)
- **SortOrder** (within topic)
- **Rationale** (why this type was chosen)
- **HelpText** (user guidance)

## How It Currently Works

Looking at the `Setup-Workflow-Notebook.ipynb` Section 1, types **were inferred** from question text patterns:

```python
# Example: "What is your Anthropic API Key?" → inferred as "text" with "encrypted": True
{"q": "What is your Anthropic API Key?", "type": "text", "required": True, "encrypted": True}

# Example: "Do you have a phone number for 2FA?" → inferred as "phone"
{"q": "Do you have a phone number for 2FA?", "type": "phone", "required": False}

# Example: "Do you want to use a custom domain?" → inferred as "boolean"
{"q": "Do you want to use a custom domain?", "type": "boolean", "required": True}
```

I used linguistic patterns from the question text:

- **Email signals**: "email address", "@", "email"
- **Password signals**: "password", "secret", "key"
- **Phone signals**: "phone number", "2FA"
- **Boolean signals**: "Do you have?", "Do you want?", "Is/Are?"
- **Select signals**: "Which?", "What ... from?", implied options
- **Numeric signals**: "How many?", "What ... number?"
- **URL signals**: "URL", "domain", "website"

## Proposed System Architecture

```
┌─────────────────────────────────────────────────────┐
│ Input: List of Question Texts (CSV, JSON, or text)  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ AI Question Analyzer (Claude/GPT-4)                 │
│                                                      │
│ Analysis Steps:                                      │
│ 1. Linguistic pattern matching                      │
│ 2. Context inference (from surrounding questions)  │
│ 3. Validation rule generation                       │
│ 4. Topic/Tab assignment (grouping)                 │
│ 5. Help text generation                             │
│ 6. Confidence scoring                               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ Output: Structured Question Metadata (JSON)         │
│                                                      │
│ {                                                    │
│   "questionText": "...",                            │
│   "displayType": "email|password|text|boolean|...", │
│   "sqlDataType": "nvarchar|bit|datetime|...",      │
│   "pocoType": "string|bool|DateTime|...",          │
│   "topic": "Inferred Topic",                        │
│   "tabName": "Tab Section",                         │
│   "sortOrder": 1,                                   │
│   "required": true|false,                           │
│   "encrypted": true|false,                          │
│   "validationRules": {...},                         │
│   "rationale": "Why this type was chosen",         │
│   "helpText": "Guidance for user",                  │
│   "confidence": 0.95                                │
│ }                                                    │
└─────────────────────────────────────────────────────┘
```

## Implementation Options

### Option 1: Python Skill (Recommended for Notebooks)

```python
# skills/infer_question_types.py

import json
from typing import List, Dict, Any
from datetime import datetime
import re

class QuestionTypeInferencer:
    """
    AI-powered question type inference for QuestionManager.
    Analyzes question text and infers metadata.
    """

    def __init__(self, ai_client=None):
        """
        Initialize with optional AI client (Claude, GPT-4, etc.)
        If no client provided, uses heuristic-based fallback.
        """
        self.ai_client = ai_client
        self.patterns = {
            'email': r'email|@|address.*email',
            'password': r'password|secret|passphrase',
            'phone': r'phone|phone number|2fa|2factor',
            'url': r'url|website|domain|website|http',
            'date': r'date|when|calendar',
            'select': r'which|choose from|select one',
            'boolean': r'do you|have|want|is|are|enable|disable',
            'number': r'how many|count|number of',
        }

    def infer_from_text(self, question_text: str, context: Dict = None) -> Dict[str, Any]:
        """
        Main method: infer all metadata from question text.

        Args:
            question_text: The question to analyze
            context: Optional dict with surrounding questions, topic, etc.

        Returns:
            Dict with inferred metadata
        """

        # Step 1: Pattern matching (fast, heuristic-based)
        base_inference = self._pattern_match(question_text)

        # Step 2: If AI client available, use for refinement
        if self.ai_client:
            ai_inference = self._ai_enhanced_inference(question_text, context)
            base_inference.update(ai_inference)

        # Step 3: Generate derived fields
        base_inference.update(self._generate_derived_fields(base_inference))

        # Step 4: Add rationale and help text
        base_inference['rationale'] = self._generate_rationale(question_text, base_inference)
        base_inference['helpText'] = self._generate_help_text(question_text, base_inference)

        return base_inference

    def _pattern_match(self, text: str) -> Dict:
        """Pattern-based type inference (heuristic fallback)"""
        text_lower = text.lower()

        for dtype, pattern in self.patterns.items():
            if re.search(pattern, text_lower):
                return self._dtype_to_metadata(dtype)

        # Default: generic text
        return self._dtype_to_metadata('text')

    def _dtype_to_metadata(self, display_type: str) -> Dict:
        """Map display type to SQL/POCO types"""
        mapping = {
            'email': {
                'displayType': 'email',
                'sqlDataType': 'nvarchar(255)',
                'pocoType': 'string',
                'required': True,
                'encrypted': False,
                'validationRules': {'pattern': r'^[^\s@]+@[^\s@]+\.[^\s@]+$'}
            },
            'password': {
                'displayType': 'password',
                'sqlDataType': 'nvarchar(255)',
                'pocoType': 'string',
                'required': True,
                'encrypted': True,
                'validationRules': {'minLength': 8}
            },
            'phone': {
                'displayType': 'phone',
                'sqlDataType': 'nvarchar(20)',
                'pocoType': 'string',
                'required': False,
                'encrypted': False,
                'validationRules': {'pattern': r'^\+?[\d\s\-\(\)]{10,}$'}
            },
            'url': {
                'displayType': 'url',
                'sqlDataType': 'nvarchar(255)',
                'pocoType': 'string',
                'required': False,
                'encrypted': False,
                'validationRules': {'pattern': r'^https?://'}
            },
            'boolean': {
                'displayType': 'boolean',
                'sqlDataType': 'bit',
                'pocoType': 'bool',
                'required': True,
                'encrypted': False,
                'validationRules': {}
            },
            'date': {
                'displayType': 'date',
                'sqlDataType': 'datetime',
                'pocoType': 'DateTime',
                'required': False,
                'encrypted': False,
                'validationRules': {}
            },
            'select': {
                'displayType': 'select',
                'sqlDataType': 'nvarchar(50)',
                'pocoType': 'string',
                'required': True,
                'encrypted': False,
                'validationRules': {}
            },
            'number': {
                'displayType': 'number',
                'sqlDataType': 'int',
                'pocoType': 'int',
                'required': False,
                'encrypted': False,
                'validationRules': {}
            },
            'text': {
                'displayType': 'text',
                'sqlDataType': 'nvarchar(max)',
                'pocoType': 'string',
                'required': False,
                'encrypted': False,
                'validationRules': {}
            }
        }
        return mapping.get(display_type, mapping['text'])

    def _ai_enhanced_inference(self, question_text: str, context: Dict = None) -> Dict:
        """
        Use AI (Claude/GPT-4) for semantic analysis and refinement.
        Better at understanding intent and nuance.
        """
        prompt = f"""
Analyze this question for a customer setup survey and infer its metadata.

Question: "{question_text}"

Provide JSON response with:
{{
  "displayType": "email|password|phone|url|date|boolean|select|number|text",
  "encrypted": true|false,
  "required": true|false,
  "topic": "Inferred grouping (e.g., 'Authentication', 'Configuration')",
  "confidence": 0.0-1.0,
  "reasoning": "Explanation of your inference",
  "suggestedOptions": [...] // if select type
}}

Be concise. Return only JSON.
        """

        # Call AI client (would be actual API call in production)
        # response = self.ai_client.invoke(prompt)
        # return json.loads(response.text)

        # Placeholder for demonstration
        return {}

    def _generate_derived_fields(self, base_inference: Dict) -> Dict:
        """Generate SQL type from display type if not already set"""
        return {
            'createdDate': datetime.now().isoformat(),
            'version': 1
        }

    def _generate_rationale(self, question_text: str, inference: Dict) -> str:
        """Generate explanation of why this type was chosen"""
        dtype = inference.get('displayType', 'text')

        rationales = {
            'email': "Question asks for 'email address' - standard email format required",
            'password': "Contains 'password' keyword - sensitive data requiring encryption",
            'phone': "References phone or 2FA - phone number format",
            'boolean': "Phrased as yes/no question ('Do you...') - boolean logic",
            'select': "Question offers limited options or uses 'which/choose' language",
            'date': "Question asks about date/time - temporal data",
            'url': "Question asks for website/domain - URL format required",
            'number': "Question asks 'how many' - numeric input",
            'text': "Open-ended question - free text response"
        }

        return rationales.get(dtype, f"Defaulted to {dtype} based on question content")

    def _generate_help_text(self, question_text: str, inference: Dict) -> str:
        """Generate user-friendly help text"""
        dtype = inference.get('displayType', 'text')
        required = "Required. " if inference.get('required') else "Optional. "

        help_texts = {
            'email': f"{required}Enter a valid email address (e.g., user@example.com)",
            'password': f"{required}Enter a secure password. Will be encrypted.",
            'phone': f"{required}Enter a phone number with country code (e.g., +1-234-567-8900)",
            'url': f"{required}Enter a complete URL (e.g., https://example.com)",
            'boolean': f"{required}Select Yes or No",
            'select': f"{required}Choose from the available options",
            'text': f"{required}Enter text (no special formatting required)",
        }

        return help_texts.get(dtype, required + "Provide the requested information")

    def batch_infer(self, questions: List[str]) -> List[Dict]:
        """Infer types for multiple questions at once"""
        results = []
        for idx, q_text in enumerate(questions, 1):
            result = self.infer_from_text(q_text)
            result['questionText'] = q_text
            result['sortOrder'] = idx
            results.append(result)
        return results


# Example usage
if __name__ == "__main__":
    inferencer = QuestionTypeInferencer()

    questions = [
        "What is your Anthropic API Key?",
        "Do you have a GitHub account?",
        "What is your email address?",
        "What is your phone number for 2FA?",
        "Which domain registrar do you use?"
    ]

    results = inferencer.batch_infer(questions)

    for result in results:
        print(json.dumps(result, indent=2))
```

### Option 2: MCP Server Tool

If you want to expose this as an MCP server (for use in other applications):

```json
{
  "name": "question-type-inferencer",
  "description": "AI-powered question metadata inference",
  "tools": [
    {
      "name": "infer_question_types",
      "description": "Infer SQL type, display type, validation rules from question text",
      "inputSchema": {
        "type": "object",
        "properties": {
          "questions": {
            "type": "array",
            "items": { "type": "string" },
            "description": "List of question texts to analyze"
          },
          "context": {
            "type": "object",
            "description": "Optional context (topic grouping, surrounding questions, etc.)"
          },
          "useAI": {
            "type": "boolean",
            "default": true,
            "description": "Use AI for semantic analysis vs. pattern matching only"
          }
        },
        "required": ["questions"]
      }
    }
  ]
}
```

### Option 3: Notebook Cell Integration

Add this to your QuestionManager setup notebook:

```python
# In a code cell
from skills.infer_question_types import QuestionTypeInferencer

# Initialize
inferencer = QuestionTypeInferencer()

# Client provides questions
client_questions = [
    "What is your Anthropic API Key?",
    "Do you have GitHub 2FA enabled?",
    "What is your email address?",
]

# Infer types
inferred_metadata = inferencer.batch_infer(client_questions)

# Convert to SurveyQuestion records
survey_records = [
    {
        **metadata,
        "id": str(uuid.uuid4()),
        "topic": "Auto-Inferred",
        "recordType": "SetupQuestion"
    }
    for metadata in inferred_metadata
]

# Output
import json
print(json.dumps(survey_records, indent=2, default=str))
```

## How to Invoke It

### From Command Line:

```powershell
python skills/infer_question_types.py < questions.txt
```

### From Notebook:

```python
# Run as skill
results = inferencer.batch_infer(questions_list)
```

### As API:

```bash
curl -X POST http://localhost:5000/infer \
  -H "Content-Type: application/json" \
  -d '{"questions": ["What is your email?", "Do you have 2FA?"]}'
```

### As MCP Tool (from other applications):

```python
response = mcp_client.call_tool(
    "infer_question_types",
    questions=["What is your email?", "Do you have 2FA?"],
    useAI=True
)
```

## Advantages

✅ **Eliminates manual type specification** — clients just provide questions
✅ **Consistent metadata generation** — same rules applied everywhere
✅ **Scalable for 100+ questions** — batch processing
✅ **Explainable** — rationale shows why types were chosen
✅ **Refineable** — AI component improves with feedback
✅ **Reusable** — same inferencer for all clients

## Challenges & Mitigations

| Challenge                | Mitigation                        |
| ------------------------ | --------------------------------- |
| Ambiguous questions      | AI component + confidence scoring |
| Missing context          | Allow optional context parameter  |
| Domain-specific types    | Extensible pattern library        |
| Incorrect inference      | Human review + feedback loop      |
| Privacy of question data | Local processing or secure API    |

## Integration with QuestionManager

When a new client provides a question list:

1. **Upload questions** → CSV, JSON, or paste into UI
2. **Run inferencer** → Auto-generates metadata
3. **Review & adjust** → UI shows confidence, allows manual edits
4. **Store** → SurveyQuestion records saved to database
5. **Repeat** → Same questions for future customers

## Success Metrics

- Time to generate 27 questions: **< 5 minutes** (vs. 30+ manual)
- Inference accuracy: **95%+** (with review)
- Ratio of auto-accepted to reviewed: **80%+**

## Next Steps

1. Implement Python skill with heuristic matching
2. Add AI client (Claude/GPT-4) for semantic analysis
3. Build notebook cell for batch processing
4. Create UI for review/adjustment
5. Add feedback loop to improve accuracy

---

**Author**: AI Question Inference System Design  
**Date**: 2026-01-16  
**Status**: Future Enhancement (Out of Scope for MVP)  
**Context**: First dendwriteai system note - exploration of automated metadata generation
