import {PressedKeys} from "./keys"

export interface Controls {
    throttle: number,
    roll: number,
    rudder: number,
    pitch: number,
    fireCannons: boolean,
}

const LeftRoll = "KeyS"
const RightRoll = "KeyF"
const LeftRudder = "KeyW"
const RightRudder = "KeyR"
const PitchUp = "KeyD"
const PitchDown = "KeyE"
const ThrottleUp = "KeyA"
const ThrottleDown = "KeyZ"
const FireCannonsKeyboard = "Space"

export function updateControls(controls: Controls, deltaTime: number, pressedKeys: PressedKeys): Controls {
    const control = (name: string): number => pressedKeys.contains(name) ? deltaTime : 0
    const controlValue = (negative: string, positive: string): number => control(positive) - control(negative)
    const clamp = (value: number, diff: number, min: number, max: number): number => Math.max(Math.min(value + diff, max), min)
    const normalize = (value: number): number =>
        value === 0 ? 0 : (value > 0 ? +1 : -1)
    const clampWithReversal = (value: number, diff: number, coef: number): number =>
        diff === 0
            ? clamp(value, -deltaTime * coef * normalize(value), -1, +1) // return controls back to neutral if not touched
            : clamp(value, diff * coef, -1, +1)

    const rollPos = controlValue(LeftRoll, RightRoll)
    const newRoll = clampWithReversal(controls.roll, rollPos, 0.001)

    const rudderPos = controlValue(LeftRudder, RightRudder)
    const newRudder = clampWithReversal(controls.rudder, rudderPos, 0.001)

    const pitchPos = controlValue(PitchDown, PitchUp)
    const newPitch = clampWithReversal(controls.pitch, pitchPos, 0.001)

    const throttlePos = controlValue(ThrottleDown, ThrottleUp)
    const MinThrottle = 0
    const MaxThrottle = 1
    const newThrottle = clamp(controls.throttle, throttlePos * 0.001, MinThrottle, MaxThrottle)

    const newTrigger = pressedKeys.contains(FireCannonsKeyboard)

    return {
        throttle: newThrottle,
        rudder: newRudder,
        pitch: newPitch,
        roll: newRoll,
        fireCannons: newTrigger,
    }
}
