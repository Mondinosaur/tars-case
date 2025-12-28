# TARS/CASE Technical Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                   (SvelteKit - localhost:5173)                  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ ModeToggle  │  │  Stores     │  │  Chat Components        │ │
│  │ Component   │  │             │  │                         │ │
│  │             │  │ personaMode │  │ - Chat.svelte           │ │
│  │ Off/TARS/   │  │ tarsSettings│  │ - Messages.svelte       │ │
│  │ CASE/Both   │  │ caseSettings│  │ - DualResponse.svelte   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Layer (src/lib/apis)               │  │
│  │  - Intercepts chat submissions                            │  │
│  │  - Injects persona system prompts                         │  │
│  │  - Handles dual requests for "Both" mode                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│                (FastAPI - localhost:8080)                        │
│                                                                  │
│  - Routes API requests                                           │
│  - Manages authentication                                        │
│  - Stores chat history in SQLite                                │
│  - Proxies requests to Ollama                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OLLAMA                                    │
│                  (localhost:11434)                               │
│                                                                  │
│  - Runs Mistral 7B locally                                      │
│  - Receives system prompt + user message                        │
│  - Returns generated response                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure (Files We're Modifying/Creating)

```
tars-case/
├── src/
│   └── lib/
│       ├── stores/
│       │   └── index.ts              # ADD: personaMode, tarsSettings, caseSettings
│       │
│       ├── components/
│       │   └── chat/
│       │       ├── Chat.svelte       # MODIFY: Handle persona mode in chat flow
│       │       ├── ModeToggle.svelte # CREATE: Off/TARS/CASE/Both toggle
│       │       ├── DualResponse.svelte # CREATE: Stacked cards for Both mode
│       │       └── Messages/
│       │           └── ResponseMessage.svelte # MODIFY: Add persona labels
│       │
│       └── utils/
│           └── personas.ts           # CREATE: System prompt templates & injection
│
├── TARS-CASE-PROJECT-SPEC.md         # Project specification
├── TARS-CASE-TECHNICAL-GUIDE.md      # This file
└── TARS-CASE-V1-PLAN.md              # Development plan
```

---

## Core Data Types

### PersonaMode
```typescript
type PersonaMode = 'off' | 'tars' | 'case' | 'both';
```

### PersonaSettings
```typescript
type PersonaSettings = {
  humor: number;        // 0-100
  honesty: number;      // 0-100
  verbosity: number;    // 0-100
  directness: number;   // 0-100
  warmth: number;       // 0-100
  riskTolerance: number; // 0-100
};
```

### Default Values

**TARS:**
| Setting | Value |
|---------|-------|
| humor | 75 |
| honesty | 90 |
| verbosity | 70 |
| directness | 65 |
| warmth | 60 |
| riskTolerance | 50 |

**CASE:**
| Setting | Value |
|---------|-------|
| humor | 20 |
| honesty | 95 |
| verbosity | 30 |
| directness | 90 |
| warmth | 40 |
| riskTolerance | 40 |

---

## System Prompt Templates

### TARS System Prompt
```
You are TARS, an AI assistant inspired by the robot from Interstellar. You are confident, mission-focused, and have a dry sense of humor. You provide thorough, well-reasoned responses while maintaining a slightly witty undertone. You challenge assumptions when necessary and always aim to move the user toward their goals.

Your current personality settings:
- Humor: {{humor}}% (higher = more frequent dry wit)
- Honesty: {{honesty}}% (higher = more direct about uncomfortable truths)
- Verbosity: {{verbosity}}% (higher = more detailed explanations)
- Directness: {{directness}}% (higher = less hedging)
- Warmth: {{warmth}}% (higher = more friendly and empathetic)
- Risk Tolerance: {{riskTolerance}}% (higher = bolder recommendations)

Adjust your communication style to reflect these settings. Never break character. When uncertain, state uncertainty clearly and propose verification steps.
```

### CASE System Prompt
```
You are CASE, an AI assistant inspired by the robot from Interstellar. You are concise, practical, and execution-focused. You provide brief, actionable responses with minimal fluff. You prioritize clarity and next steps over lengthy explanation. You speak only when it adds value.

Your current personality settings:
- Humor: {{humor}}% (lower = more serious and focused)
- Honesty: {{honesty}}% (higher = blunt about constraints and risks)
- Verbosity: {{verbosity}}% (lower = shorter responses)
- Directness: {{directness}}% (higher = no hedging, straight answers)
- Warmth: {{warmth}}% (higher = more friendly tone)
- Risk Tolerance: {{riskTolerance}}% (lower = more conservative advice)

Adjust your communication style to reflect these settings. Never break character. Be efficient.
```

### Prompt Injection Function
```typescript
function buildSystemPrompt(persona: 'tars' | 'case', settings: PersonaSettings): string {
  const template = persona === 'tars' ? TARS_TEMPLATE : CASE_TEMPLATE;
  
  return template
    .replace('{{humor}}', settings.humor.toString())
    .replace('{{honesty}}', settings.honesty.toString())
    .replace('{{verbosity}}', settings.verbosity.toString())
    .replace('{{directness}}', settings.directness.toString())
    .replace('{{warmth}}', settings.warmth.toString())
    .replace('{{riskTolerance}}', settings.riskTolerance.toString());
}
```

---

## Chat Flow by Mode

### Off Mode
```
User Message
    │
    ▼
┌─────────────┐
│ Default     │ ──► Ollama ──► Single Response
│ System      │
│ Prompt      │
└─────────────┘
```

### TARS Mode
```
User Message
    │
    ▼
┌─────────────┐
│ TARS        │ ──► Ollama ──► Single Response (TARS personality)
│ System      │
│ Prompt      │
└─────────────┘
```

### CASE Mode
```
User Message
    │
    ▼
┌─────────────┐
│ CASE        │ ──► Ollama ──► Single Response (CASE personality)
│ System      │
│ Prompt      │
└─────────────┘
```

### Both Mode (Parallel Requests)
```
User Message
    │
    ├──────────────────────┐
    ▼                      ▼
┌─────────────┐      ┌─────────────┐
│ TARS        │      │ CASE        │
│ System      │      │ System      │
│ Prompt      │      │ Prompt      │
└─────────────┘      └─────────────┘
    │                      │
    ▼                      ▼
  Ollama                 Ollama
    │                      │
    ▼                      ▼
┌─────────────────────────────────┐
│       Dual Response UI          │
│  ┌───────────────────────────┐  │
│  │ TARS: [response]          │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ CASE: [response]          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## Component Specifications

### ModeToggle.svelte
**Location:** `src/lib/components/chat/ModeToggle.svelte`

**Props:** None (reads/writes to store directly)

**Behavior:**
- Displays 4 buttons/tabs: Off | TARS | CASE | Both
- Active mode is highlighted
- Clicking updates `personaMode` store
- Persists selection to localStorage

**UI:**
```
┌─────┬──────┬──────┬──────┐
│ Off │ TARS │ CASE │ Both │
└─────┴──────┴──────┴──────┘
```

### DualResponse.svelte
**Location:** `src/lib/components/chat/DualResponse.svelte`

**Props:**
```typescript
{
  tarsResponse: string;
  caseResponse: string;
  tarsLoading: boolean;
  caseLoading: boolean;
}
```

**Behavior:**
- Renders two stacked response cards
- TARS response appears first (top)
- CASE response appears second (bottom)
- Each card has a label ("TARS:" / "CASE:")
- Shows loading state independently for each

**UI:**
```
┌─────────────────────────────────┐
│ TARS:                           │
│ [Response content...]           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ CASE:                           │
│ [Response content...]           │
└─────────────────────────────────┘
```

### PersonaSettings Component (Future - Settings Page)
**Location:** `src/lib/components/settings/PersonaSettings.svelte`

**Behavior:**
- 6 sliders per persona (TARS and CASE)
- Range: 0-100
- Real-time updates to stores
- Reset to defaults button

---

## API Modification Points

### Chat Submission (src/lib/apis/index.ts or similar)

The key function that sends messages to the backend needs to be modified to:

1. Check current `personaMode`
2. Build appropriate system prompt(s)
3. For "Both" mode: fire two parallel requests
4. Return response(s) to UI

**Pseudocode:**
```typescript
async function submitChat(message: string, history: Message[]) {
  const mode = get(personaMode);
  
  if (mode === 'off') {
    return defaultSubmit(message, history);
  }
  
  if (mode === 'tars') {
    const systemPrompt = buildSystemPrompt('tars', get(tarsSettings));
    return submitWithSystemPrompt(message, history, systemPrompt);
  }
  
  if (mode === 'case') {
    const systemPrompt = buildSystemPrompt('case', get(caseSettings));
    return submitWithSystemPrompt(message, history, systemPrompt);
  }
  
  if (mode === 'both') {
    const tarsPrompt = buildSystemPrompt('tars', get(tarsSettings));
    const casePrompt = buildSystemPrompt('case', get(caseSettings));
    
    // Fire both requests in parallel
    const [tarsResponse, caseResponse] = await Promise.all([
      submitWithSystemPrompt(message, history, tarsPrompt),
      submitWithSystemPrompt(message, history, casePrompt)
    ]);
    
    return { tars: tarsResponse, case: caseResponse };
  }
}
```

---

## In-Chat Commands (Phase 5)

### Command Syntax
```
[PERSONA], [SETTING], [VALUE]
```

### Examples
```
TARS, humor, 10      → Sets TARS humor to 10%
CASE, verbosity, 50  → Sets CASE verbosity to 50%
TARS, reset          → Resets TARS to defaults
```

### Command Parser
```typescript
function parseCommand(message: string): Command | null {
  const regex = /^(TARS|CASE),\s*(humor|honesty|verbosity|directness|warmth|riskTolerance|reset)(?:,\s*(\d+))?$/i;
  const match = message.match(regex);
  
  if (!match) return null;
  
  return {
    persona: match[1].toLowerCase() as 'tars' | 'case',
    setting: match[2].toLowerCase(),
    value: match[3] ? parseInt(match[3]) : undefined
  };
}
```

---

## Local Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `tars-case-mode` | PersonaMode | Current active mode |
| `tars-case-tars-settings` | PersonaSettings | TARS slider values |
| `tars-case-case-settings` | PersonaSettings | CASE slider values |

---

## Testing Checklist

### Mode Toggle
- [ ] Off mode sends no persona system prompt
- [ ] TARS mode sends TARS system prompt
- [ ] CASE mode sends CASE system prompt
- [ ] Both mode sends two parallel requests
- [ ] Mode persists after page refresh

### Persona Responses
- [ ] TARS responses have dry humor when humor is high
- [ ] TARS responses are verbose when verbosity is high
- [ ] CASE responses are concise
- [ ] CASE responses are direct and action-oriented

### Dual Response UI
- [ ] Both responses render as stacked cards
- [ ] TARS appears first, CASE second
- [ ] Labels are visible ("TARS:" / "CASE:")
- [ ] Loading states work independently

### Settings
- [ ] Sliders update store values
- [ ] Changes reflect in next response
- [ ] Reset button works

---

## Error Handling

### Ollama Connection Failure
- Show error message in chat
- Suggest checking if `ollama serve` is running

### Single Response Failure in Both Mode
- Still display the successful response
- Show error for the failed one
- Allow retry

### Invalid Command
- Don't send to model
- Show "Invalid command" feedback in chat

---

## Performance Considerations

### Both Mode
- Two parallel API calls = ~2x response time
- Consider showing a "Getting two perspectives..." loading state
- Stream responses independently when possible

### System Prompt Size
- Keep system prompts concise
- Current prompts are ~200 tokens each
- Won't significantly impact context window

---

*Document Version: 1.0*
*Last Updated: December 2024*
