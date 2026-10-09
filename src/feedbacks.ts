import type ModuleInstance from './main.js'
import type { Handle } from './Interfaces/Handle.js'

export type FeedbacksSchema = {
	handleStatus: {
		type: 'boolean'
		options: {
			un: number
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		handleStatus: {
			name: 'Handle Status',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00ff00,
				color: 0x000000,
			},
			options: [
				{
					id: 'un',
					type: 'number',
					label: 'User Number',
					default: 1,
					min: 1,
					max: 999,
				},
			],
			callback: (feedback) => {
				// Check if the handle is active based on the handles data
				const handle = self.handles.find((h: Handle) => h.userNumber === feedback.options.un)
				return handle?.active || false
			},
		},
	})
}
