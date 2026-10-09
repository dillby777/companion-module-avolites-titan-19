import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { Socket } from 'net'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateHandleVariableValues, UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import type { Handle } from './Interfaces/Handle.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	private heartbeatInterval?: NodeJS.Timeout
	public handles: Handle[] = [] // Store handles data for feedback

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions

		// Start heartbeat
		await this.startHeartbeat()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
			this.heartbeatInterval = undefined
		}
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		// Validate configuration
		if (!this.isConfigValid()) {
			this.updateStatus(InstanceStatus.BadConfig, 'Invalid configuration')
			return
		}

		// Restart heartbeat with new config
		await this.restartHeartbeat()
	}

	private isConfigValid(): boolean {
		if (!this.config.host || this.config.host.trim() === '') {
			this.log('error', 'Host IP address is required')
			return false
		}

		if (!this.config.port || this.config.port < 1 || this.config.port > 65535) {
			this.log('error', 'Port must be between 1 and 65535')
			return false
		}

		if (this.config.enableHeartbeat && (this.config.heartbeatFrequency < 1 || this.config.heartbeatFrequency > 300)) {
			this.log('error', 'Heartbeat frequency must be between 5 and 300 seconds')
			return false
		}

		return true
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateHandleVariableValues(): void {
		UpdateHandleVariableValues(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	async sendCommand(command: string): Promise<boolean> {
		const baseUrl = `http://${this.config.host}:${this.config.port}/titan`

		try {
			const url = `${baseUrl}/${command}`
			this.log('debug', `Sending command: ${url}`)

			const response = await fetch(url, {
				method: 'POST',
				signal: AbortSignal.timeout(3000), // 3 second timeout for commands
			})

			if (!response.ok) {
				const errorText = await response.text().catch(() => 'Unknown error')
				this.log('error', `Command failed: HTTP ${response.status}: ${response.statusText} - ${errorText}`)
				return false
			}

			const result = await response.json().catch(() => ({}))
			this.log('debug', `Command result: ${JSON.stringify(result)}`)
			return true
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			this.log('error', `Command error: ${errorMessage}`)

			if (error instanceof Error && error.name === 'AbortError') {
				this.log('error', 'Command timed out - Titan may be unresponsive')
			} else if (error instanceof TypeError && error.message.includes('fetch')) {
				this.log('error', 'Network error during command execution')
			}

			return false
		}
	}

	private async restartHeartbeat(): Promise<void> {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
			this.heartbeatInterval = undefined
		}
		await this.startHeartbeat()
	}

	private async startHeartbeat(): Promise<void> {
		// Call APIs immediately
		await this.callApis()

		// Only set up interval if heartbeat is enabled
		if (this.config.enableHeartbeat) {
			// Convert seconds to milliseconds
			const intervalMs = this.config.heartbeatFrequency * 1000
			this.heartbeatInterval = setInterval(() => {
				void this.callApis()
			}, intervalMs)
		}
	}

	private async checkConnectivity(): Promise<boolean> {
		return new Promise((resolve) => {
			const socket = new Socket()
			socket.setTimeout(2000) // 2 second timeout

			socket.connect(this.config.port, this.config.host, () => {
				socket.destroy()
				resolve(true)
			})

			socket.on('error', () => {
				socket.destroy()
				resolve(false)
			})

			socket.on('timeout', () => {
				socket.destroy()
				resolve(false)
			})
		})
	}

	async callApis(): Promise<void> {
		const baseUrl = `http://${this.config.host}:${this.config.port}/titan`

		// First check if the host is reachable
		const isReachable = await this.checkConnectivity()
		if (!isReachable) {
			this.log('warn', `Host ${this.config.host}:${this.config.port} is not reachable, skipping API calls`)
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Host not reachable')
			return
		}

		this.log('debug', `Calling APIs with baseUrl: ${baseUrl}`)

		try {
			// Call SoftwareVersion
			const softwareVersionUrl = `${baseUrl}/get/System/SoftwareVersion`
			this.log('debug', `Fetching: ${softwareVersionUrl}`)
			const softwareVersionResponse = await fetch(softwareVersionUrl, { signal: AbortSignal.timeout(5000) })
			if (!softwareVersionResponse.ok) {
				throw new Error(
					`SoftwareVersion API failed: HTTP ${softwareVersionResponse.status}: ${softwareVersionResponse.statusText}`,
				)
			}
			const softwareVersionData = await softwareVersionResponse.json()
			this.log('info', `SoftwareVersion: ${JSON.stringify(softwareVersionData)}`)
			// Set software version variable
			this.setVariableValues({ software_version: JSON.stringify(softwareVersionData) })

			// Call ShowName
			const showNameUrl = `${baseUrl}/get/Show/ShowName`
			this.log('debug', `Fetching: ${showNameUrl}`)
			const showNameResponse = await fetch(showNameUrl, { signal: AbortSignal.timeout(5000) })
			if (!showNameResponse.ok) {
				throw new Error(`ShowName API failed: HTTP ${showNameResponse.status}: ${showNameResponse.statusText}`)
			}
			const showNameData = await showNameResponse.json()
			this.log('info', `ShowName: ${JSON.stringify(showNameData)}`)
			// Set show name variable
			this.setVariableValues({ show_name: JSON.stringify(showNameData) })

			// Call playback handles
			const playbacksUrl = `${baseUrl}/handles/Playbacks`
			const playbackWindowUrl = `${baseUrl}/handles/PlaybackWindow`
			this.log('debug', `Fetching: ${playbacksUrl} and ${playbackWindowUrl}`)
			const [playbacksResponse, playbackWindowResponse] = await Promise.all([
				fetch(playbacksUrl, { signal: AbortSignal.timeout(5000) }),
				fetch(playbackWindowUrl, { signal: AbortSignal.timeout(5000) }),
			])
			if (!playbacksResponse.ok) {
				throw new Error(`Playbacks API failed: HTTP ${playbacksResponse.status}: ${playbacksResponse.statusText}`)
			}
			if (!playbackWindowResponse.ok) {
				throw new Error(
					`PlaybackWindow API failed: HTTP ${playbackWindowResponse.status}: ${playbackWindowResponse.statusText}`,
				)
			}
			const [playbacksData, playbackWindowData] = await Promise.all([
				playbacksResponse.json(),
				playbackWindowResponse.json(),
			])
			const rawHandlesData = [...(playbacksData as any[]), ...(playbackWindowData as any[])]
			this.log('info', `Handles: Fetched`)
			//this.log('info', `Handles: ${JSON.stringify(rawHandlesData)}`)
			// Normalize payload values so feedback matching works consistently
			this.handles = rawHandlesData.map((handle) => {
				const userNumber = typeof handle.userNumber === 'string' ? Number(handle.userNumber) : handle.userNumber
				return {
					...handle,
					userNumber,
					active: handle.active === true || handle.active === 'true',
				}
			}) as Handle[]

			// Update presets with new handle data
			this.updatePresets()

			// Update actions with new handle data for dropdowns
			this.updateActions()

			// Rebuild variable definitions so removed handles drop off, then push their values
			this.updateVariableDefinitions()
			this.updateHandleVariableValues()

			// Refresh feedback evaluation for updated handle state
			this.checkFeedbacks('handleStatus')

			// If all calls succeed, set status to Ok
			this.updateStatus(InstanceStatus.Ok)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			this.log('error', `Error calling APIs: ${errorMessage}`)
			if (error instanceof TypeError && error.message.includes('fetch')) {
				this.log('error', 'Network error - check network connection, IP address, and port')
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Network error')
			} else if (error instanceof Error && error.name === 'AbortError') {
				this.log('error', 'API call timed out - Titan may be unresponsive')
				this.updateStatus(InstanceStatus.ConnectionFailure, 'API timeout')
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure, `API error: ${errorMessage}`)
			}
		}
	}
}
