import { PomodoroPhaseType } from "@/domain/PomodoroPhaseType"

export interface PomodoroPhase {
    type: PomodoroPhaseType
    minutes: number
}

// 25 -> 5 -> 25 -> 5 -> 25 -> 15, repeating
export const POMODORO_CYCLE: PomodoroPhase[] = [
    { type: PomodoroPhaseType.Focus, minutes: 25 },
    { type: PomodoroPhaseType.ShortBreak, minutes: 5 },
    { type: PomodoroPhaseType.Focus, minutes: 25 },
    { type: PomodoroPhaseType.ShortBreak, minutes: 5 },
    { type: PomodoroPhaseType.Focus, minutes: 25 },
    { type: PomodoroPhaseType.LongBreak, minutes: 15 },
]

export const PHASE_LABEL: Record<PomodoroPhaseType, string> = {
    [PomodoroPhaseType.Focus]: 'Focus',
    [PomodoroPhaseType.ShortBreak]: 'Short break',
    [PomodoroPhaseType.LongBreak]: 'Long break',
}
