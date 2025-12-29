<script lang="ts">
	import { tarsSettings, caseSettings } from '$lib/stores';
	
	const sliders = [
		{ key: 'humor', label: 'Humor' },
		{ key: 'honesty', label: 'Honesty' },
		{ key: 'verbosity', label: 'Verbosity' },
		{ key: 'directness', label: 'Directness' },
		{ key: 'warmth', label: 'Warmth' },
		{ key: 'riskTolerance', label: 'Risk Tolerance' }
	];
	
	function resetTars() {
		tarsSettings.set({
			humor: 75, honesty: 90, verbosity: 70,
			directness: 65, warmth: 60, riskTolerance: 50
		});
	}
	
	function resetCase() {
		caseSettings.set({
			humor: 20, honesty: 95, verbosity: 30,
			directness: 90, warmth: 40, riskTolerance: 40
		});
	}
</script>

<div class="flex flex-col gap-6 p-4">
	<!-- TARS Settings -->
	<div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-lg font-semibold">TARS</h3>
			<button 
				class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
				on:click={resetTars}
			>
				Reset
			</button>
		</div>
		
		{#each sliders as slider}
			<div class="mb-3">
				<div class="flex justify-between text-sm mb-1">
					<span>{slider.label}</span>
					<span class="text-gray-500">{$tarsSettings[slider.key]}%</span>
				</div>
				<input 
					type="range" 
					min="0" 
					max="100" 
					bind:value={$tarsSettings[slider.key]}
					class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
				/>
			</div>
		{/each}
	</div>
	
	<!-- CASE Settings -->
	<div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-lg font-semibold">CASE</h3>
			<button 
				class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
				on:click={resetCase}
			>
				Reset
			</button>
		</div>
		
		{#each sliders as slider}
			<div class="mb-3">
				<div class="flex justify-between text-sm mb-1">
					<span>{slider.label}</span>
					<span class="text-gray-500">{$caseSettings[slider.key]}%</span>
				</div>
				<input 
					type="range" 
					min="0" 
					max="100" 
					bind:value={$caseSettings[slider.key]}
					class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
				/>
			</div>
		{/each}
	</div>
</div>

