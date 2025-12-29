<script lang="ts">
	import { personaMode } from '$lib/stores';
	import { onMount } from 'svelte';
	import PersonaSettings from './PersonaSettings.svelte';

	let showSettings = false;

	const modes = [
		{ id: 'off', label: 'Off' },
		{ id: 'tars', label: 'TARS' },
		{ id: 'case', label: 'CASE' },
		{ id: 'both', label: 'Both' }
	] as const;

	onMount(() => {
		const saved = localStorage.getItem('tars-case-mode');
		if (saved && ['off', 'tars', 'case', 'both'].includes(saved)) {
			personaMode.set(saved as 'off' | 'tars' | 'case' | 'both');
		}
	});

	function setMode(mode: 'off' | 'tars' | 'case' | 'both') {
		personaMode.set(mode);
		localStorage.setItem('tars-case-mode', mode);
	}

	function toggleSettings() {
		showSettings = !showSettings;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (showSettings && !target.closest('.persona-settings-container')) {
			showSettings = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="flex items-center gap-2 relative z-50 persona-settings-container">
	<div class="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
		{#each modes as mode}
			<button
				class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors
					{$personaMode === mode.id
						? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
						: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
				on:click={() => setMode(mode.id)}
			>
				{mode.label}
			</button>
		{/each}
	</div>

	<!-- Settings gear button -->
	<button
		class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
		on:click|stopPropagation={toggleSettings}
		title="Persona Settings"
	>
		<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
		</svg>
	</button>

	<!-- Settings dropdown -->
	{#if showSettings}
		<div class="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
			<PersonaSettings />
		</div>
	{/if}
</div>