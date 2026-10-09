import type ModuleInstance from './main.js'
import type { Handle } from './Interfaces/Handle.js'

export function getHandleNameChoices(instance: ModuleInstance): { id: string; label: string }[] {
	if (!instance.handles || instance.handles.length === 0) {
		return [{ id: '', label: 'No handles loaded' }]
	}

	return instance.handles.map((handle: Handle) => {
		// Use legend if available, otherwise name, otherwise construct a descriptive name
		const displayName =
			handle.legend ||
			handle.name ||
			`${handle.type.charAt(0).toUpperCase() + handle.type.slice(1)} ${handle.userNumber}`
		return {
			id: handle.name || handle.legend || `Handle ${handle.userNumber}`,
			label: displayName,
		}
	})
}

export function getHandleNameChoicesByType(
	instance: ModuleInstance,
	handleType: string,
): { id: string; label: string }[] {
	if (!instance.handles || instance.handles.length === 0) {
		return [{ id: '', label: 'No handles loaded' }]
	}

	// Map handle type to Titan API type names
	const typeMapping: { [key: string]: string } = {
		cue: 'cueListHandle',
		group: 'groupHandle',
		palette: 'paletteHandle',
		fixture: 'fixtureHandle',
		playbackGroup: 'playbackGroupHandle',
	}

	const titanType = typeMapping[handleType] || handleType

	return instance.handles
		.filter((handle: Handle) => handle.type === titanType)
		.map((handle: Handle) => {
			// Use legend if available, otherwise name, otherwise construct a descriptive name
			const displayName =
				handle.legend ||
				handle.name ||
				`${handle.type.replace('Handle', '').charAt(0).toUpperCase() + handle.type.replace('Handle', '').slice(1)} ${handle.userNumber}`
			return {
				id: handle.name || handle.legend || `Handle ${handle.userNumber}`,
				label: displayName,
			}
		})
}

export function getOrganizedHandleNameChoices(instance: ModuleInstance): { id: string; label: string }[] {
	if (!instance.handles || instance.handles.length === 0) {
		return [{ id: '', label: 'No handles loaded' }]
	}

	// Group handles by type for better organization
	const groupedHandles: { [key: string]: Handle[] } = {}
	for (const handle of instance.handles) {
		const typeKey = handle.type.replace('Handle', '')
		if (!groupedHandles[typeKey]) {
			groupedHandles[typeKey] = []
		}
		groupedHandles[typeKey].push(handle)
	}

	const choices: { id: string; label: string }[] = []

	// Add handles grouped by type
	for (const [type, handles] of Object.entries(groupedHandles)) {
		// Add a separator/header for each type
		choices.push({ id: `__${type}__`, label: `--- ${type.charAt(0).toUpperCase() + type.slice(1)}s ---` })

		for (const handle of handles) {
			const displayName =
				handle.legend || handle.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${handle.userNumber}`
			choices.push({
				id: `${type}:${handle.name || handle.legend || `Handle ${handle.userNumber}`}`,
				label: `  ${displayName}`,
			})
		}
	}

	return choices
}

export const fields = {
	USERNUMBER: {
		id: 'un' as const,
		type: 'number' as const,
		label: 'User Number',
		min: 1,
		max: 999,
		default: 1,
	},
	PERCENTAGE: {
		id: 'percentage' as const,
		type: 'number' as const,
		label: 'Percentage (0-100)',
		min: 0,
		max: 100,
		default: 100,
	},
	ALWAYSREFIRE: {
		id: 'refire' as const,
		type: 'checkbox' as const,
		label: 'Always Refire',
		default: true,
	},
	ONOFF: {
		id: 'onoff' as const,
		type: 'dropdown' as const,
		label: 'On/Off',
		choices: [
			{ id: 'on', label: 'On' },
			{ id: 'off', label: 'Off' },
		],
		default: 'on',
	},
	CLACTION: {
		id: 'cuelistaction' as const,
		type: 'dropdown' as const,
		label: 'Action',
		choices: [
			{ id: 'Play', label: 'GO' },
			{ id: 'Back', label: 'BACK' },
		],
		default: 'Play',
	},
	CUENUMBER: {
		id: 'cn' as const,
		type: 'number' as const,
		label: 'Cue Number',
		min: 1,
		max: 999,
		default: 1,
	},
	AUTOFIRE: {
		id: 'af' as const,
		type: 'checkbox' as const,
		label: 'Auto Fire',
		default: false,
	},
	ADV_DECR: {
		id: 'adv_decr' as const,
		type: 'dropdown' as const,
		label: 'Action',
		choices: [
			{ id: 'AdvanceNextStep', label: 'Advance' },
			{ id: 'DecrementNextStep', label: 'Decrement' },
		],
		default: 'AdvanceNextStep',
	},
	FADETIME: {
		id: 'ft' as const,
		type: 'number' as const,
		label: 'Fade Time (seconds)',
		min: 0,
		max: 999,
		default: 0,
	},
	USERMASTERFADETIME: {
		id: 'masterft' as const,
		type: 'checkbox' as const,
		label: 'Use Master Fade Time',
		default: true,
	},
	BOSTATE: {
		id: 'bo' as const,
		type: 'dropdown' as const,
		label: 'State',
		choices: [
			{ id: 'true', label: 'Blackout' },
			{ id: 'false', label: 'Normal' },
		],
		default: 'true',
	},
	TIMELINE_ACTION: {
		id: 'timeline_action' as const,
		type: 'dropdown' as const,
		label: 'Action',
		choices: [
			{ id: 'Play', label: 'Play' },
			{ id: 'Pause', label: 'Pause' },
			{ id: 'Stop', label: 'Stop' },
		],
		default: 'Play',
	},
	ONOFFDMX: {
		id: 'onoffdmx' as const,
		type: 'dropdown' as const,
		label: 'DMX Output',
		choices: [
			{ id: 'on', label: 'Enable' },
			{ id: 'off', label: 'Disable' },
		],
		default: 'on',
	},
	TIMECODE_SELECT: {
		id: 'tc_select' as const,
		type: 'dropdown' as const,
		label: 'Timecode',
		choices: [
			{ id: 'Timecode1', label: 'Timecode 1' },
			{ id: 'Timecode2', label: 'Timecode 2' },
		],
		default: 'Timecode1',
	},
	TIMECODE_SOURCE: {
		id: 'tc_source' as const,
		type: 'dropdown' as const,
		label: 'Source',
		choices: [
			{ id: 'Internal', label: 'Internal' },
			{ id: 'MTC', label: 'MTC' },
			{ id: 'LTC', label: 'LTC' },
			{ id: 'Art-Net', label: 'Art-Net' },
		],
		default: 'Internal',
	},
	TIMECODE_ACTION: {
		id: 'tc_action' as const,
		type: 'dropdown' as const,
		label: 'Action',
		choices: [
			{ id: 'Start', label: 'Start' },
			{ id: 'Stop', label: 'Stop' },
			{ id: 'Pause', label: 'Pause' },
			{ id: 'Resume', label: 'Resume' },
		],
		default: 'Start',
	},
	MASTER_LEVEL: {
		id: 'level' as const,
		type: 'number' as const,
		label: 'Level (0-100)',
		min: 0,
		max: 100,
		default: 100,
	},
}
