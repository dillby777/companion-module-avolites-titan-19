import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	enableHeartbeat: boolean
	heartbeatFrequency: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				"This module communicates with Avolites Titan through its HTTP WebAPI. The desk needs to be running version 14.0 or higher for the module to fully work. Ensure the Titan's HTTP API is enabled in the console settings.",
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Avolites Titan IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Avolites Titan Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 4430,
		},
		{
			type: 'checkbox',
			id: 'enableHeartbeat',
			label: 'Enable Heartbeat',
			width: 6,
			default: true,
		},
		{
			type: 'number',
			id: 'heartbeatFrequency',
			label: 'Heartbeat Frequency (seconds)',
			width: 6,
			min: 1,
			max: 300,
			default: 30,
			tooltip:
				'How often to poll Titan for status updates. Lower values provide more responsive feedback but may impact performance.',
		},
	]
}
