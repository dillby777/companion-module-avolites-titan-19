import type ModuleInstance from './main.js'
import type { Handle } from './Interfaces/Handle.js'

export type VariablesSchema = {
	software_version: string
	show_name: string
	// dynamic per-handle variables (handle_<name>_<userNumber>_active) are keyed at runtime
	[key: string]: string | boolean | undefined
}

// Companion variable IDs only allow word characters
function sanitizeVariableId(input: string): string {
	return input.replace(/[^A-Za-z0-9_]/g, '_')
}

export function getHandleVariableId(handle: Handle): string {
	const displayName = handle.name || handle.legend || 'Handle'
	return `handle_${sanitizeVariableId(displayName)}_${handle.userNumber}_active`
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const handleDefinitions = Object.fromEntries(
		self.handles.map((handle) => {
			const displayName = handle.name || handle.legend || `Handle ${handle.userNumber}`
			return [getHandleVariableId(handle), { name: `${displayName} Active` }]
		}),
	)

	self.setVariableDefinitions({
		software_version: { name: 'Titan Software Version' },
		show_name: { name: 'Current Show Name' },
		...handleDefinitions,
	})
}

export function UpdateHandleVariableValues(self: ModuleInstance): void {
	const values = Object.fromEntries(self.handles.map((handle) => [getHandleVariableId(handle), handle.active ?? false]))

	self.setVariableValues(values)
}
