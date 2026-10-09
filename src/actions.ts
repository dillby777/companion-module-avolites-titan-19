import type ModuleInstance from './main.js'
import { fields } from './fields.js'

export type ActionsSchema = {
	// Manual control
	manual_update: {
		options: Record<string, never>
	}
	// Playback control
	playbackAtPercentage: {
		options: {
			un: number
			percentage: number
			refire: boolean
		}
	}
	playbackFlash: {
		options: {
			un: number
			onoff: 'on' | 'off'
			refire: boolean
		}
	}
	playbackSwop: {
		options: {
			un: number
			onoff: 'on' | 'off'
		}
	}
	// Cuelist control
	cuelistGo: {
		options: {
			un: number
			cuelistaction: 'Play' | 'Back'
		}
	}
	cuelistSetNextCue: {
		options: {
			un: number
			cn: number
			af: boolean
		}
	}
	cuelistAdvDecrNextStep: {
		options: {
			un: number
			adv_decr: 'AdvanceNextStep' | 'DecrementNextStep'
		}
	}
	releasePlayback: {
		options: {
			un: number
			ft: number
			masterft: boolean
		}
	}
	releaseAllPlaybacks: {
		options: {
			ft: number
			masterft: boolean
		}
	}
	// Macro control
	recallMacro: {
		options: {
			un: number
		}
	}
	// Master control
	blackoutDesk: {
		options: {
			bo: 'true' | 'false'
		}
	}
	setGrandMasterFaderLevel: {
		options: {
			percentage: number
		}
	}
	tapTempo: {
		options: {
			un: number
		}
	}
	// Timeline control
	timelineControl: {
		options: {
			un: number
			timeline_action: 'Play' | 'Pause' | 'Stop'
		}
	}
	releaseTimeline: {
		options: {
			un: number
		}
	}
	timelineReleaseAll: {
		options: Record<string, never>
	}
	// System control
	freezeDmx: {
		options: {
			onoffdmx: 'on' | 'off'
		}
	}
	// Timecode control
	timecodeSource: {
		options: {
			tc_select: 'Timecode1' | 'Timecode2'
			tc_source: 'Internal' | 'MTC' | 'LTC' | 'Art-Net'
		}
	}
	timecodeAction: {
		options: {
			tc_select: 'Timecode1' | 'Timecode2'
			tc_action: 'Start' | 'Stop' | 'Pause' | 'Resume'
		}
	}
	// Handle control
	setMasterLevel: {
		options: {
			un: number
			level: number
		}
	}
	killPlayback: {
		options: {
			un: number
		}
	}
	killAllPlaybacks: {
		options: Record<string, never>
	}
	toggleLatchPlayback: {
		options: {
			un: number
		}
	}
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		manual_update: {
			name: 'Manual Update',
			options: [],
			callback: async () => {
				await self.callApis()
			},
		},
		playbackAtPercentage: {
			name: 'Playback @ Percentage',
			options: [fields.USERNUMBER, fields.PERCENTAGE, fields.ALWAYSREFIRE],
			callback: async (action): Promise<void> => {
				const percentage = action.options.percentage ?? 100
				const level = percentage / 100

				await self.sendCommand(
					`script/2/Playbacks/FirePlaybackAtLevel?handle_userNumber=${action.options.un}&level_level=${level}&alwaysRefire=${action.options.refire ?? true}`,
				)
			},
		},
		playbackFlash: {
			name: 'Playback Flash',
			options: [fields.USERNUMBER, fields.ONOFF, fields.ALWAYSREFIRE],
			callback: async (action) => {
				const percentage = action.options.onoff == 'on' ? '1' : '0'

				await self.sendCommand(
					`script/2/Playbacks/FirePlaybackAtLevel?handle_userNumber=${action.options.un}&level_level=${percentage}&alwaysRefire=${action.options.refire ?? true}`,
				)
			},
		},
		playbackSwop: {
			name: 'Playback Swop',
			options: [fields.USERNUMBER, fields.ONOFF],
			callback: async (action) => {
				const command = action.options.onoff == 'on' ? 'SwopPlayback' : 'ClearSwopPlayback'

				await self.sendCommand(`script/2/Playbacks/${command}?handle_userNumber=${action.options.un}`)
			},
		},
		cuelistGo: {
			name: 'Cuelist GO / BACK',
			options: [fields.USERNUMBER, fields.CLACTION],
			callback: async (action) => {
				await self.sendCommand(
					'script/2/CueLists/' + action.options.cuelistaction + '?handle_userNumber=' + action.options.un,
				)
			},
		},
		cuelistSetNextCue: {
			name: 'Cuelist set next cue',
			options: [fields.USERNUMBER, fields.CUENUMBER, fields.AUTOFIRE],
			callback: async (action) => {
				const success = await self.sendCommand(
					`script/2/CueLists/SetNextCue?handle_userNumber=${action.options.un}&stepNumber=${action.options.cn}`,
				)

				if (success) {
					if (action.options.af) {
						await self.sendCommand(`script/2/CueLists/Play?handle_userNumber=${action.options.un}`)
					}
				}
			},
		},
		cuelistAdvDecrNextStep: {
			name: 'Cuelist advance/decrement next step',
			options: [fields.USERNUMBER, fields.ADV_DECR],
			callback: async (action) => {
				await self.sendCommand(`script/2/CueLists/${action.options.adv_decr}?handle_userNumber=${action.options.un}`)
			},
		},
		releasePlayback: {
			name: 'Release playback',
			options: [fields.USERNUMBER, fields.FADETIME, fields.USERMASTERFADETIME],
			callback: async (action): Promise<void> => {
				await self.sendCommand(
					`script/2/Playbacks/ReleasePlayback?handle_userNumber=${action.options.un}&fadeTime=${action.options.ft}&useMasterReleaseTime=${action.options.masterft}`,
				)
			},
		},
		releaseAllPlaybacks: {
			name: 'Release all playbacks',
			options: [fields.FADETIME, fields.USERMASTERFADETIME],
			callback: async (action): Promise<void> => {
				await self.sendCommand(
					`script/2/Playbacks/ReleaseAllPlaybacks?fadeTime=${action.options.ft}&useMasterReleaseTime=${action.options.masterft}`,
				)
			},
		},
		recallMacro: {
			name: 'Recall macro',
			options: [fields.USERNUMBER],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/UserMacros/RecallMacro?handle_userNumber=${action.options.un}`)
			},
		},
		blackoutDesk: {
			name: 'Blackout desk',
			options: [fields.BOSTATE],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Masters/BlackOutDesk?deskBlackOutState=${action.options.bo}`)
			},
		},
		setGrandMasterFaderLevel: {
			name: 'Set grand master fader level',
			options: [fields.PERCENTAGE],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Masters/SetGrandMasterFaderLevel?oldValue=&value=${action.options.percentage}`)
			},
		},
		tapTempo: {
			name: 'Tap tempo',
			options: [fields.USERNUMBER],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Playbacks/TapTempo?handle_userNumber=${action.options.un}&panelTimeStamp=`)
			},
		},
		timelineControl: {
			name: 'Timeline control',
			options: [fields.USERNUMBER, fields.TIMELINE_ACTION],
			callback: async (action): Promise<void> => {
				await self.sendCommand(
					`script/2/Timelines/${action.options.timeline_action}?handle_userNumber=${action.options.un}`,
				)
			},
		},
		releaseTimeline: {
			name: 'Release timeline',
			options: [fields.USERNUMBER],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Timelines/ReleaseTimeline?handle_userNumber=${action.options.un}`)
			},
		},
		timelineReleaseAll: {
			name: 'Timeline - Release all',
			options: [],
			callback: async (): Promise<void> => {
				await self.sendCommand(`script/2/Timelines/ReleaseAllTimelines`)
			},
		},
		freezeDmx: {
			name: 'Enable / Disable DMX Out',
			options: [fields.ONOFFDMX],
			callback: async (action): Promise<void> => {
				const command = action.options.onoffdmx == 'on' ? 'true' : 'false'

				await self.sendCommand(`script/2/Dmx/FreezeDmx?freeze=${command}`)
			},
		},
		timecodeSource: {
			name: 'Timecode - Set source',
			options: [fields.TIMECODE_SELECT, fields.TIMECODE_SOURCE],
			callback: async (action): Promise<void> => {
				await self.sendCommand(
					`script/2/Timecode/${action.options.tc_select}/SetSource?source=${action.options.tc_source}`,
				)
			},
		},
		timecodeAction: {
			name: 'Timecode control',
			options: [fields.TIMECODE_SELECT, fields.TIMECODE_ACTION],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Timecode/${action.options.tc_select}/${action.options.tc_action}`)
			},
		},
		setMasterLevel: {
			name: 'Set Master Level',
			options: [fields.USERNUMBER, fields.MASTER_LEVEL],
			callback: async (action): Promise<void> => {
				await self.sendCommand(
					`script/2/Masters/SetMasterLevel?handle_userNumber=${action.options.un}&value=${action.options.level}`,
				)
			},
		},
		killPlayback: {
			name: 'Kill Playback',
			options: [fields.USERNUMBER],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Playbacks/KillPlayback?handle_userNumber=${action.options.un}`)
			},
		},
		killAllPlaybacks: {
			name: 'Kill All Playbacks',
			options: [],
			callback: async (): Promise<void> => {
				await self.sendCommand('script/2/Playbacks/KillAllPlaybacks')
			},
		},
		toggleLatchPlayback: {
			name: 'Toggle Latch Playback',
			options: [fields.USERNUMBER],
			callback: async (action): Promise<void> => {
				await self.sendCommand(`script/2/Playbacks/ToggleLatchPlayback?handle_userNumber=${action.options.un}`)
			},
		},
	})
}
