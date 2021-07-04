import {Set} from "immutable"
import {KeyboardEventTypes, KeyboardInfo} from "@babylonjs/core"

export type PressedKeys = Set<string>

export const newPressedKeys: PressedKeys = Set<string>()

export const updateKeys = (pressedKeys: PressedKeys, kbInfo: KeyboardInfo): PressedKeys => {
    switch (kbInfo.type) {
    case KeyboardEventTypes.KEYDOWN:
        return pressedKeys.add(kbInfo.event.code)
    case KeyboardEventTypes.KEYUP:
        return pressedKeys.remove(kbInfo.event.code)
    default:
        return pressedKeys
    }
}
