<script lang="ts">
	import { getContext } from 'svelte';
	import Modal from '../common/Modal.svelte';
	import PersonaSettings from './PersonaSettings.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';

	const i18n = getContext('i18n');

	export let show = false;
</script>

<Modal bind:show size="sm">
	<div class="text-gray-700 dark:text-gray-100 px-5 py-4">
		<div class="flex justify-between dark:text-gray-300 pb-2">
			<div class="text-lg font-medium self-center">{$i18n.t('Persona Settings')}</div>
			<button class="self-center" on:click={() => (show = false)}>
				<XMark className={'size-5'} />
			</button>
		</div>

		<PersonaSettings />
	</div>
</Modal>

