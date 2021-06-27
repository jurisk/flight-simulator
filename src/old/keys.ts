import {Set} from "immutable"
import {KeyboardEventTypes, KeyboardInfo} from "@babylonjs/core"

export let pressedKeys: Set<string> = Set()

export function updateKeys(kbInfo: KeyboardInfo): void {
    switch (kbInfo.type) {
    case KeyboardEventTypes.KEYDOWN:
        pressedKeys = pressedKeys.add(kbInfo.event.key)
        break
    case KeyboardEventTypes.KEYUP:
        pressedKeys = pressedKeys.remove(kbInfo.event.key)
        break
    }
}
