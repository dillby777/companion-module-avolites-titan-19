import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = []
	const presets: CompanionPresetDefinitions<ModuleSchema> = {}

	if (self.handles && self.handles.length > 0) {
		// Group handles by type for better organization
		const handleGroups: { [key: string]: typeof self.handles } = {}

		for (const handle of self.handles) {
			const type = handle.type || 'unknown'
			if (!handleGroups[type]) {
				handleGroups[type] = []
			}
			handleGroups[type].push(handle)
		}

		// Create preset sections for each handle type
		for (const [type, handles] of Object.entries(handleGroups)) {
			const section: CompanionPresetSection = {
				id: `handles-${type}`,
				name: `${type.charAt(0).toUpperCase() + type.slice(1)} Handles`,
				definitions: handles.map((h) => `handle-${h.userNumber}`),
			}
			structure.push(section)

			// Create presets for each handle
			for (const handle of handles) {
				const displayName = handle.name || handle.legend || `Handle ${handle.userNumber}`

				presets[`handle-${handle.userNumber}`] = {
					type: 'simple' as const,
					name: displayName,
					style: {
						text: displayName,
						size: 'auto',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'playbackAtPercentage',
									options: {
										un: handle.userNumber,
										percentage: 100,
										refire: true,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'handleStatus',
							options: {
								un: handle.userNumber,
							},
							style: {
								bgcolor: combineRgb(0, 255, 0),
							},
						},
					],
				}
			}
		}
	} else {
		// Fallback structure when no handles are loaded
		structure.push({
			id: 'no-handles',
			name: 'No Handles Available',
			definitions: [],
		})
	}

	self.setPresetDefinitions(structure, presets)
}
