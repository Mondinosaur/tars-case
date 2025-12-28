<script lang="ts">
	import { personaMode } from '$lib/stores';
	import { onMount } from 'svelte';

	const modes = [
		{ id: 'off', label: 'Off' },
		{ id: 'tars', label: 'TARS' },
		{ id: 'case', label: 'CASE' },
		{ id: 'both', label: 'Both' }
	] as const;

	// Load from localStorage on mount
	onMount(() => {
		const saved = localStorage.getItem('tars-case-mode');
		if (saved && ['off', 'tars', 'case', 'both'].includes(saved)) {
			personaMode.set(saved as 'off' | 'tars' | 'case' | 'both');
		}
	});

	// Save to localStorage when mode changes
	function setMode(mode: 'off' | 'tars' | 'case' | 'both') {
		personaMode.set(mode);
		localStorage.setItem('tars-case-mode', mode);
	}
</script>

<div class="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 relative z-50">
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