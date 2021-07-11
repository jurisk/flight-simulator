import {AdvancedDynamicTexture, Button} from "@babylonjs/gui"
import * as GUI from "@babylonjs/gui"
import {Scene} from "@babylonjs/core"

export interface GuiSetters {
    setUfosRemaining: (text: string) => void,
    setCannonShells: (text: string) => void,
    setThrustText: (text: string) => void,
    setAltitudeText: (text: string) => void,
}

export function createGui(scene: Scene): GuiSetters {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)
    const panel = new GUI.StackPanel()
    panel.width = "220px"
    panel.paddingTop = "10px"
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
    advancedTexture.addControl(panel)

    function createButton(name: string, initialText: string) {
        const button = GUI.Button.CreateSimpleButton(name + "-button", initialText)
        button.width = "200px"
        button.height = "40px"
        button.color = "white"
        button.background = "black"
        panel.addControl(button)
        return button
    }

    function setter(button: Button): (text: string) => void {
        return (x) => {
            if (button.textBlock) {
                button.textBlock.text = x
            }
        }
    }

    const ufosRemainingButton = createButton("ufos-remaining", "")
    const cannonShellsButton = createButton("cannon-shells", "")
    const thrustButton = createButton("thrust", "")
    const altitudeButton = createButton("altitude", "")

    return {
        setUfosRemaining: setter(ufosRemainingButton),
        setCannonShells: setter(cannonShellsButton),
        setThrustText: setter(thrustButton),
        setAltitudeText: setter(altitudeButton),
    }
}
