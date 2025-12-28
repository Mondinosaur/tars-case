# TARS/CASE V1 Development Plan

## Version 1 Scope

**Goal:** A working local AI chatbot with dual-persona functionality (TARS and CASE) that can respond independently or together.

**Not in V1:** Cloud sync, file uploads, RAG, projects, reminders, agentic workflows.

---

## Phase Summary

| Phase | Name | Status | Est. Time |
|-------|------|--------|-----------|
| 1 | Local Setup | ✅ Complete | - |
| 2 | Dev Environment | ✅ Complete | - |
| 3 | Persona System | 🔄 In Progress | 2-3 hours |
| 4 | Mode Toggle & Dual Response | Not Started | 2-3 hours |
| 5 | In-Chat Commands | Not Started | 1-2 hours |
| 6 | Settings UI | Not Started | 1-2 hours |
| 7 | Polish & Testing | Not Started | 1-2 hours |

---

## Phase 3: Persona System (Current)

### Objective
Create the data structures and prompt templates that define TARS and CASE personalities.

### Tasks

#### 3.1 Add Stores ✅
**File:** `src/lib/stores/index.ts`

Add to the file:
```typescript
// TARS/CASE Persona System
export type PersonaMode = 'off' | 'tars' | 'case' | 'both';

export type PersonaSettings = {
  humor: number;
  honesty: number;
  verbosity: number;
  directness: number;
  warmth: number;
  riskTolerance: number;
};

export const personaMode: Writable<PersonaMode> = writable('off');

export const tarsSettings: Writable<PersonaSettings> = writable({
  humor: 75,
  honesty: 90,
  verbosity: 70,
  directness: 65,
  warmth: 60,
  riskTolerance: 50
});

export const caseSettings: Writable<PersonaSettings> = writable({
  humor: 20,
  honesty: 95,
  verbosity: 30,
  directness: 90,
  warmth: 40,
  riskTolerance: 40
});
```

#### 3.2 Create Persona Utils
**File:** `src/lib/utils/personas.ts` (new file)

Create system prompt templates and helper functions:
- `TARS_SYSTEM_PROMPT` template
- `CASE_SYSTEM_PROMPT` template
- `buildSystemPrompt(persona, settings)` function
- `getDefaultSettings(persona)` function

#### 3.3 Test Prompts Manually
Before integrating, test the system prompts directly in the Open WebUI:
1. Go to Settings → System Prompt
2. Paste TARS prompt with default values filled in
3. Chat and verify TARS personality works
4. Repeat for CASE

### Deliverables
- [ ] Stores added to index.ts
- [ ] personas.ts utility file created
- [ ] System prompts tested manually

---

## Phase 4: Mode Toggle & Dual Response

### Objective
Add UI to switch between modes and display dual responses in "Both" mode.

### Tasks

#### 4.1 Create ModeToggle Component
**File:** `src/lib/components/chat/ModeToggle.svelte` (new file)

Simple 4-button toggle:
```
┌─────┬──────┬──────┬──────┐
│ Off │ TARS │ CASE │ Both │
└─────┴──────┴──────┴──────┘
```

Requirements:
- Read/write to `personaMode` store
- Highlight active mode
- Save to localStorage for persistence

#### 4.2 Add ModeToggle to Chat UI
**File:** `src/lib/components/chat/Chat.svelte`

- Import ModeToggle component
- Place it in the header area (near model selector)

#### 4.3 Modify Chat Submission
**File:** `src/lib/apis/index.ts` (or wherever chat is submitted)

- Intercept message submission
- Check current `personaMode`
- Inject appropriate system prompt
- For "Both" mode: fire two parallel requests

#### 4.4 Create DualResponse Component
**File:** `src/lib/components/chat/DualResponse.svelte` (new file)

- Two stacked cards
- "TARS:" and "CASE:" labels
- Independent loading states

#### 4.5 Integrate DualResponse into Messages
**File:** `src/lib/components/chat/Messages.svelte` or similar

- Detect when response is dual
- Render DualResponse component instead of single response

### Deliverables
- [ ] ModeToggle component working
- [ ] Mode toggle visible in chat UI
- [ ] Single persona mode (TARS or CASE) changes system prompt
- [ ] Both mode fires two requests
- [ ] Dual responses display as stacked cards

---

## Phase 5: In-Chat Commands

### Objective
Allow users to adjust persona settings by typing commands in chat.

### Tasks

#### 5.1 Create Command Parser
**File:** `src/lib/utils/commandParser.ts` (new file)

Parse commands like:
- `TARS, humor, 10`
- `CASE, verbosity, 50`
- `TARS, reset`

#### 5.2 Intercept Commands Before Submission
**File:** Modify chat submission logic

- Check if message matches command pattern
- If yes: update settings, show confirmation, don't send to model
- If no: proceed with normal submission

#### 5.3 Add Command Feedback
Show a system message confirming the setting change:
```
✓ TARS humor set to 10%
```

### Deliverables
- [ ] Commands parsed correctly
- [ ] Settings update when command is entered
- [ ] Confirmation message shown
- [ ] Commands don't get sent to the model

---

## Phase 6: Settings UI

### Objective
Add a settings panel where users can adjust persona sliders visually.

### Tasks

#### 6.1 Create PersonaSettings Component
**File:** `src/lib/components/settings/PersonaSettings.svelte` (new file)

- Two sections: TARS and CASE
- 6 sliders each (humor, honesty, verbosity, directness, warmth, riskTolerance)
- Range: 0-100
- Real-time updates to stores

#### 6.2 Add Reset Buttons
- Reset TARS to defaults
- Reset CASE to defaults

#### 6.3 Integrate into Settings Modal
**File:** `src/lib/components/chat/SettingsModal.svelte`

Add a new tab or section for "Personas"

### Deliverables
- [ ] Persona settings accessible from settings modal
- [ ] Sliders work and update stores
- [ ] Reset buttons restore defaults
- [ ] Settings persist across sessions (localStorage)

---

## Phase 7: Polish & Testing

### Objective
Refine the UX and ensure everything works reliably.

### Tasks

#### 7.1 Visual Polish
- Consistent styling for mode toggle
- Nice card design for dual responses
- Smooth loading states

#### 7.2 Edge Cases
- Handle Ollama connection failures gracefully
- Handle one response failing in Both mode
- Ensure mode persists after page refresh

#### 7.3 Testing
- Test all 4 modes
- Test slider changes affect responses
- Test in-chat commands
- Test on different screen sizes

#### 7.4 Documentation
- Update README with TARS/CASE features
- Add usage instructions

### Deliverables
- [ ] All modes work reliably
- [ ] UI looks polished
- [ ] Error handling is graceful
- [ ] Documentation updated

---

## V1 Success Criteria

### Must Have
- [ ] Mode toggle works (Off / TARS / CASE / Both)
- [ ] TARS has distinct personality (witty, verbose, advisory)
- [ ] CASE has distinct personality (concise, direct, action-oriented)
- [ ] Both mode shows two stacked responses
- [ ] Settings sliders affect personality
- [ ] In-chat commands adjust settings

### Nice to Have
- [ ] Smooth animations on mode switch
- [ ] Response streaming works in Both mode
- [ ] Keyboard shortcut to toggle modes

### Explicitly Not in V1
- Cloud sync
- File uploads
- Projects/folders
- Reminders
- RAG/knowledge base
- Mobile app
- Custom personas beyond TARS/CASE

---

## Development Commands

### Start Development Environment
```bash
# Terminal 1 - Ollama
ollama serve

# Terminal 2 - Frontend
cd ~/Documents/tars-case
npm run dev

# Terminal 3 - Backend
cd ~/Documents/tars-case/backend
source venv/bin/activate
uvicorn open_webui.main:app --host 0.0.0.0 --port 8080 --reload
```

### Access
- Frontend: http://localhost:5173/
- Backend API: http://localhost:8080/
- Ollama: http://localhost:11434/

### Git Workflow
```bash
# Save progress
git add .
git commit -m "Description of changes"
git push origin main
```

---

## File Change Summary

### New Files to Create
| File | Phase | Purpose |
|------|-------|---------|
| `src/lib/utils/personas.ts` | 3 | System prompt templates |
| `src/lib/components/chat/ModeToggle.svelte` | 4 | Mode selection UI |
| `src/lib/components/chat/DualResponse.svelte` | 4 | Stacked response cards |
| `src/lib/utils/commandParser.ts` | 5 | Parse in-chat commands |
| `src/lib/components/settings/PersonaSettings.svelte` | 6 | Slider UI |

### Files to Modify
| File | Phase | Changes |
|------|-------|---------|
| `src/lib/stores/index.ts` | 3 | Add persona stores |
| `src/lib/components/chat/Chat.svelte` | 4 | Add mode toggle, handle modes |
| `src/lib/apis/index.ts` | 4 | Modify chat submission |
| `src/lib/components/chat/Messages.svelte` | 4 | Handle dual responses |
| `src/lib/components/chat/SettingsModal.svelte` | 6 | Add persona settings tab |

---

## Progress Tracking

### Today's Session
- [x] Phase 1: Local Setup
- [x] Phase 2: Dev Environment
- [ ] Phase 3: Persona System (started)

### Next Session
- [ ] Complete Phase 3
- [ ] Start Phase 4

---

*Document Version: 1.0*
*Last Updated: December 2024*
