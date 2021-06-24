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
    ArcRotateCamera, FreeCamera,
    KeyboardEventTypes,
    MeshAssetTask,
    TextureAssetTask
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
    const initialAirplaneRotation = new Vector3(Math.PI / 16, Math.PI * (7/8), 0)

    function airplaneMesh(): AbstractMesh {
        const airplaneModelTask = assetManagerResult.taskNameMap["airplane-model"] as MeshAssetTask
        return airplaneModelTask.loadedMeshes[0]
    }

    const airplane = airplaneMesh()
    console.log(airplane.material) // TODO: I have not applied "F 15 Specular.jpg" and I don't think how it reflects light is correct
    airplane.position = initialAirplanePosition
    airplane.rotation = initialAirplaneRotation

    const SpeedFactor = 0.02

    const LeftRoll = "s"
    const RightRoll = "f"
    const LeftRudder = "w"
    const RightRudder = "r"
    const PitchUp = "d"
    const PitchDown = "e"
    const ThrottleUp = "a"
    const ThrottleDown = "z"

    useBeforeRender(() => {
        if (scene) {
            scene.setActiveCameraByName("arc-rotate-camera")

            const deltaTimeInMillis = scene.getEngine().getDeltaTime()

            const airplane = airplaneMesh()

            const rotationAmount = Math.PI * deltaTimeInMillis * 0.001
            const PitchFactor = 0.4
            const RudderFactor = 0.2

            if (pressedKeys.contains(LeftRoll)) {
                airplane.rotate(new Vector3(0, 0, -1), rotationAmount)
            }

            if (pressedKeys.contains(RightRoll)) {
                airplane.rotate(new Vector3(0, 0, 1), rotationAmount)
            }

            if (pressedKeys.contains(LeftRudder)) {
                airplane.rotate(new Vector3(0, 1, 0), rotationAmount * RudderFactor)
            }

            if (pressedKeys.contains(RightRudder)) {
                airplane.rotate(new Vector3(0, -1, 0), rotationAmount * RudderFactor)
            }

            if (pressedKeys.contains(PitchUp)) {
                airplane.rotate(new Vector3(1, 0, 0), rotationAmount * PitchFactor)
            }

            if (pressedKeys.contains(PitchDown)) {
                airplane.rotate(new Vector3(-1, 0, 0), rotationAmount * PitchFactor)
            }

            if (pressedKeys.contains(ThrottleUp)) {
                console.log("TODO - implement throttle up")
            }

            if (pressedKeys.contains(ThrottleDown)) {
                console.log("TODO - implement throttle down")
            }

            const forward = new Vector3(0, 0, 1)
            const direction = airplane
                .getDirection(forward)
                .scale(deltaTimeInMillis * SpeedFactor)

            airplane.position.addInPlace(direction)

            console.log(freeCameraRef.current, cameraRef.current)

            const camera = cameraRef.current
            if (camera) {
                camera.setTarget(airplane.position)
            } else {
                console.error("no camera")
            }
        }
    })

    const cameraRef = useRef<Nullable<ArcRotateCamera>>(null)
    const freeCameraRef = useRef<Nullable<FreeCamera>>(null)

    return (
        <>
            <arcRotateCamera
                ref={cameraRef}
                name="arc-rotate-camera"
                alpha={-Math.PI / 2}
                beta={(0.5 + (Math.PI / 4))}
                radius={100}
                target={ new Vector3(0, 0, 0) }
                minZ={0.001}
                wheelPrecision={50}
                lowerRadiusLimit={30}
                upperRadiusLimit={150}
                lowerBetaLimit={0.1}
                upperBetaLimit={(Math.PI / 2) * 0.9}
            />

            <directionalLight
                name="directional-light"
                direction={new Vector3(-1, -1, 0)}
                diffuse={new Color3(1, 1, 1)}
                specular={new Color3(0, 0, 0)}
            />

            <groundFromHeightMap
                name="ground"
                url="assets/textures/worldHeightMap.jpeg"
                width={200}
                height={200}
                subdivisions={256}
                minHeight={0}
                maxHeight={10}
            >
                <standardMaterial
                    name="ground-material"
                >
                    <texture
                        url=""
                        fromInstance={(assetManagerResult.taskNameMap["earth"] as TextureAssetTask).texture}
                        assignTo="diffuseTexture"
                    />
                </standardMaterial>
            </groundFromHeightMap>

            <Skybox rootUrl="assets/textures/skybox" size={800} />
        </>
    )
}

export function FlightSimulator(): JSX.Element {
    return (
        <Scene>
            <universalCamera name="universal-camera" position={new Vector3(0, 0, 0)}/>
            <Suspense fallback={<Fallback/>}>
                <FlightSimulatorInner/>
            </Suspense>
        </Scene>
    )
}
