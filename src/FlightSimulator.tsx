import React, {Suspense, useRef} from "react"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {Color3} from "@babylonjs/core/Maths/math.color"
import {
    Scene,
    Skybox,
    Task,
    TaskType,
    useAssetManager,
    useBeforeRender,
    useScene
} from "react-babylonjs"
import {
    AbstractMesh,
    FreeCamera,
    KeyboardEventTypes,
    MeshAssetTask,
    TextureAssetTask,
    Scene as BabylonScene,
} from "@babylonjs/core"
import "@babylonjs/inspector"
import {Set} from "immutable"
import {Nullable} from "@babylonjs/core/types"
import {Fallback} from "./Fallback"

const textureAssets: Task[] = [
    { taskType: TaskType.Texture, url: "assets/textures/earth.jpeg", name: "earth" },
    { taskType: TaskType.Texture, url: "assets/textures/worldHeightMap.jpeg", name: "world-height-map" },
    { taskType: TaskType.Mesh, rootUrl: "assets/models/f15/", sceneFilename: "f15.gltf", name: "airplane-model" },
]

function FlightSimulatorInner(): JSX.Element {
    const scene = useScene()

    let pressedKeys: Set<string> = Set()

    if (scene) {
        scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))

        // TODO: This needs a click / focus on the canvas before it starts registering - not sure what is the best way to fix
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN:
                pressedKeys = pressedKeys.add(kbInfo.event.key)
                break
            case KeyboardEventTypes.KEYUP:
                pressedKeys = pressedKeys.remove(kbInfo.event.key)
                break
            }
        })
    }

    const assetManagerResult = useAssetManager(textureAssets, {
        useDefaultLoadingScreen: true,
        reportProgress: true,
    })

    const initialAirplanePosition = new Vector3(0, 10, 10)
    const initialAirplaneRotation = new Vector3(0, Math.PI * (7/8), 0)

    function airplaneMesh(): AbstractMesh {
        const airplaneModelTask = assetManagerResult.taskNameMap["airplane-model"] as MeshAssetTask
        return airplaneModelTask.loadedMeshes[0]
    }

    const airplane = airplaneMesh()
    console.log(airplane.material) // TODO: I have not applied "F 15 Specular.jpg" and I don't think how it reflects light is correct
    airplane.position = initialAirplanePosition
    airplane.rotation = initialAirplaneRotation

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

    useBeforeRender(() => {
        if (scene) {
            scene.setActiveCameraByName("follow-camera")
            const deltaTimeInMillis = scene.getEngine().getDeltaTime()

            const airplane = airplaneMesh()

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
            // TODO: throttle isn't really speed, have to decouple and add stalling

            const forward = new Vector3(0, 0, 1)
            const SpeedFactor = 0.02

            const direction = airplane
                .getDirection(forward)
                .scale(deltaTimeInMillis * SpeedFactor * throttle)

            airplane.position.addInPlace(direction)

            const camera = cameraRef.current
            if (camera) {
                const followDirection = new Vector3(0, 0.2, -1)
                const FollowCameraDistance = 20
                camera.position = airplane.position.add(airplane.getDirection(followDirection).scale(FollowCameraDistance))
                camera.target = airplane.position
            } else {
                console.error("no camera")
            }
        }
    })

    const cameraRef = useRef<Nullable<FreeCamera>>(null)
    const edgeLength = 1000

    return (
        <>
            <freeCamera
                ref={cameraRef}
                name="follow-camera"
                position={new Vector3(0, 0, 0)}
            />

            <directionalLight
                name="directional-light"
                direction={new Vector3(-1, -1, 0)}
                diffuse={new Color3(1, 1, 1)}
                specular={new Color3(0, 0, 0)}
            />

            <hemisphericLight
                name="hemispheric-light"
                direction={new Vector3(0, 1, 0)}
                intensity={0.25}
            />

            <groundFromHeightMap
                name="map"
                url="assets/textures/worldHeightMap.jpeg"
                width={edgeLength}
                height={edgeLength}
                subdivisions={256}
                minHeight={0}
                maxHeight={40}
            >
                <standardMaterial
                    name="map-material"
                >
                    <texture
                        url=""
                        fromInstance={(assetManagerResult.taskNameMap["earth"] as TextureAssetTask).texture}
                        assignTo="diffuseTexture"
                    />
                </standardMaterial>
            </groundFromHeightMap>

            <disc
                name="ground"
                radius={edgeLength * 2}
                rotation-x={Math.PI / 2}
            >
                <standardMaterial
                    name="ground-material"
                    diffuseColor={new Color3(0.004, 0.004, 0.2)}
                />
            </disc>

            <Skybox rootUrl="assets/textures/skybox" size={ edgeLength } />
        </>
    )
}

export function FlightSimulator(): JSX.Element {
    return (
        <Scene
            fogEnabled={true}
            fogMode={BabylonScene.FOGMODE_EXP2}
            fogDensity={0.002}
            fogColor={new Color3(0.45, 0.65, 1.0)}
        >
            <universalCamera name="initial-camera" position={new Vector3(0, 0, 0)}/>
            <Suspense fallback={<Fallback/>}>
                <FlightSimulatorInner/>
            </Suspense>
        </Scene>
    )
}
