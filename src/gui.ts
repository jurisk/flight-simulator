import {AdvancedDynamicTexture, Button} from "@babylonjs/gui"
import * as GUI from "@babylonjs/gui"
import {Scene} from "@babylonjs/core"
import {GameState} from "./FlightSimulator"
import {Vector3} from "@babylonjs/core/Maths/math.vector"

export interface GuiSetters {
    setUfosRemaining: (text: string) => void,
    setEarthHitPoints: (text: string) => void,
    setCannonShells: (text: string) => void,
    setAltitudeText: (text: string) => void,
    setThrustText: (text: string) => void,
    setRollText: (text: string) => void,
    setPitchText: (text: string) => void,
    setRudderText: (text: string) => void,
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
        button.fontFamily = "Press Start 2P"
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
    const earthHitPointsButton = createButton("earth-hitpoints", "")
    const cannonShellsButton = createButton("cannon-shells", "")
    const altitudeButton = createButton("altitude", "")
    const thrustButton = createButton("thrust", "")
    const rollButton = createButton("roll", "")
    const pitchButton = createButton("pitch", "")
    const rudderButton = createButton("rudder", "")

    return {
        setUfosRemaining: setter(ufosRemainingButton),
        setEarthHitPoints: setter(earthHitPointsButton),
        setCannonShells: setter(cannonShellsButton),
        setAltitudeText: setter(altitudeButton),
        setThrustText: setter(thrustButton),
        setRollText: setter(rollButton),
        setPitchText: setter(pitchButton),
        setRudderText: setter(rudderButton),
    }
}

export function updateGui(gui: GuiSetters, gameState: GameState, ufos: number, airplanePosition: Vector3): void {
    function formatPercent(x: number): string {
        return `${Math.round(x*100)}%`
    }

    function formatControl(x: number, low: string, high: string): string {
        const Eps = 0.02

        if (x < -Eps) {
            return low + formatPercent(-x)
        } else if (x > Eps) {
            return high + formatPercent(x)
        } else {
            return "Center"
        }
    }

    gui.setUfosRemaining(`UFOs: ${ufos}`)
    gui.setEarthHitPoints(`Earth HP: ${gameState.earth.hitPoints.toFixed()}`)
    gui.setCannonShells(`Shells: ${gameState.airplane.cannonShells}`)
    gui.setAltitudeText(`Altitude: ${airplanePosition.y.toFixed()}`)
    gui.setThrustText(`Thrust: ${formatPercent(gameState.controls.throttle)}`)
    gui.setRudderText(`Rudder: ${formatControl(gameState.controls.rudder, "L", "R")}`)
    gui.setRollText(`Roll: ${formatControl(gameState.controls.roll, "L", "R")}`)
    gui.setPitchText(`Pitch: ${formatControl(gameState.controls.pitch, "D", "U")}`)
}
