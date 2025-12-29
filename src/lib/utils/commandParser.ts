import { tarsSettings, caseSettings, type PersonaSettings } from '$lib/stores';
import { get } from 'svelte/store';

type CommandResult = {
  isCommand: boolean;
  handled: boolean;
  message?: string;
};

const VALID_SETTINGS = ['humor', 'honesty', 'verbosity', 'directness', 'warmth', 'risktolerance'];

export function parseCommand(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase();
  
  // Pattern: "\TARS, humor, 50" or "\CASE, verbosity, 30"
  const match = trimmed.match(/^\\(tars|case),?\s*(\w+),?\s*(\d+|reset)$/);
  
  if (!match) {
    return { isCommand: false, handled: false };
  }
  
  const [, persona, setting, value] = match;
  
  // Handle reset
  if (value === 'reset') {
    if (persona === 'tars') {
      tarsSettings.set({
        humor: 75, honesty: 90, verbosity: 70,
        directness: 65, warmth: 60, riskTolerance: 50
      });
      return { isCommand: true, handled: true, message: `TARS settings reset to defaults.` };
    } else {
      caseSettings.set({
        humor: 20, honesty: 95, verbosity: 30,
        directness: 90, warmth: 40, riskTolerance: 40
      });
      return { isCommand: true, handled: true, message: `CASE settings reset to defaults.` };
    }
  }
  
  // Validate setting name
  const normalizedSetting = setting.replace(/\s+/g, '').toLowerCase();
  if (!VALID_SETTINGS.includes(normalizedSetting)) {
    return { isCommand: true, handled: false, message: `Unknown setting: ${setting}` };
  }
  
  // Validate value
  const numValue = parseInt(value, 10);
  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    return { isCommand: true, handled: false, message: `Value must be 0-100` };
  }
  
  // Map to actual setting key
  const settingKey = normalizedSetting === 'risktolerance' ? 'riskTolerance' : normalizedSetting;
  
  // Update the appropriate store
  const store = persona === 'tars' ? tarsSettings : caseSettings;
  store.update((s) => ({ ...s, [settingKey]: numValue }));
  
  const personaName = persona.toUpperCase();
  return { 
    isCommand: true, 
    handled: true, 
    message: `${personaName} ${settingKey} set to ${numValue}%` 
  };
}

