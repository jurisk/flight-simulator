import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {AbstractMesh, FreeCamera} from "@babylonjs/core"
import {Set} from "immutable"

const LeftRoll = "s"
const RightRoll = "f"
const LeftRudder = "w"
const RightRudder = "r"
const PitchUp = "d"
const PitchDown = "e"
const ThrottleUp = "a"
const ThrottleDown = "z"

let throttle = 0.75
let roll = 0
let rudder = 0
let pitch = 0

export function updateScene(
    deltaTimeInMillis: number,
    airplane: AbstractMesh,
    camera: FreeCamera | null,
    pressedKeys: Set<string>,
): void {
    const control = (name: string): number => pressedKeys.contains(name) ? deltaTimeInMillis : 0
    const controls = (negative: string, positive: string): number => control(positive) - control(negative)
    const clamp = (value: number, diff: number, min: number, max: number): number => Math.max(Math.min(value + diff, max), min)
    const normalize = (value: number): number =>
        value === 0 ? 0 : (value > 0 ? +1 : -1)
    const clampWithReversal = (value: number, diff: number, coef: number): number =>
        diff === 0
            ? clamp(value, -deltaTimeInMillis * coef * normalize(value), -1, +1) // return controls back to neutral if not touched
            : clamp(value, diff * coef, -1, +1)

    const rotationAmount = Math.PI * deltaTimeInMillis * 0.001

    const rollPos = controls(LeftRoll, RightRoll)
    roll = clampWithReversal(roll, rollPos, 0.001)
    airplane.rotate(new Vector3(0, 0, 1), rotationAmount * roll)

    const rudderPos = controls(LeftRudder, RightRudder)
    rudder = clampWithReversal(rudder, rudderPos, 0.001)
    const RudderFactor = 0.2
    airplane.rotate(new Vector3(0, 1, 0), rotationAmount * RudderFactor * rudder)

    const pitchPos = controls(PitchDown, PitchUp)
    pitch = clampWithReversal(pitch, pitchPos, 0.001)
    if (pitch < 0) { // we can pitch down worse than we can pitch up
        airplane.rotate(new Vector3(1, 0, 0), rotationAmount * pitch * 0.05)
    } else if (pitch > 0) {
        airplane.rotate(new Vector3(1, 0, 0), rotationAmount * pitch * 0.4)
    }

    const throttlePos = controls(ThrottleDown, ThrottleUp)
    const MinThrottle = 0
    const MaxThrottle = 1
    throttle = clamp(throttle, throttlePos * 0.001, MinThrottle, MaxThrottle)
    // TODO: throttle isn't really speed, have to decouple and add inertia and stalling

    const forward = new Vector3(0, 0, 1)
    const SpeedFactor = 0.02

    const direction = airplane
        .getDirection(forward)
        .scale(deltaTimeInMillis * SpeedFactor * throttle)

    // TODO: move to more advanced physics such as https://www.youtube.com/watch?v=p3jDJ9FtTyM / https://github.com/gasgiant/Aircraft-Physics
    airplane.position.addInPlace(direction)

    if (camera) {
        const followDirection = new Vector3(0, 0.2, -1)
        const FollowCameraDistance = 20
        camera.position = airplane.position.add(airplane.getDirection(followDirection).scale(FollowCameraDistance))
        camera.target = airplane.position
    }
}
