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
    MeshAssetTask,
    Scene as BabylonScene,
} from "@babylonjs/core"
import "@babylonjs/inspector"
import {Nullable} from "@babylonjs/core/types"
import {Fallback} from "./Fallback"
import {updateScene} from "./scene-updates"
import {pressedKeys, updateKeys} from "./keys"

interface FlightSimulatorInnerProps {
    airplane: AbstractMesh,
    scene: BabylonScene,
}

function FlightSimulatorInner({airplane, scene}: FlightSimulatorInnerProps): JSX.Element {
    console.log("scene", scene)

    if (scene) {
        scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))

        // TODO: This needs a click / focus on the canvas before it starts registering - not sure what is the best way to fix
        scene.onKeyboardObservable.add(updateKeys)
    }

    const initialAirplanePosition = new Vector3(0, 10, 10)
    const initialAirplaneRotation = new Vector3(0, Math.PI * (7/8), 0)

    console.log(airplane.material) // TODO: I have not applied "F 15 Specular.jpg" and I don't think how it reflects light is correct
    airplane.position = initialAirplanePosition
    airplane.rotation = initialAirplaneRotation

    useBeforeRender(() => {
        if (scene) {
            const deltaTimeInMillis = scene.getEngine().getDeltaTime()

            const camera = cameraRef.current

            updateScene(deltaTimeInMillis, airplane, camera, pressedKeys)
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
                        url="assets/textures/earth.jpeg"
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

function LoadAssets(): JSX.Element {
    const textureAssets: Task[] = [
        { taskType: TaskType.Texture, url: "assets/textures/earth.jpeg", name: "earth" },
        { taskType: TaskType.Texture, url: "assets/textures/worldHeightMap.jpeg", name: "world-height-map" },
        { taskType: TaskType.Mesh, rootUrl: "assets/models/f15/", sceneFilename: "f15.gltf", name: "airplane-model" },
    ]

    const assetManagerResult = useAssetManager(textureAssets, {
        useDefaultLoadingScreen: true,
        reportProgress: true,
    })

    const scene = useScene()

    function findMesh(name: string): AbstractMesh {
        const airplaneModelTask = assetManagerResult.taskNameMap[name] as MeshAssetTask
        return airplaneModelTask.loadedMeshes[0]
    }

    return (
        (scene ? <FlightSimulatorInner airplane={findMesh("airplane-model")} scene={scene}/> : <Fallback/>)
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
            <Suspense fallback={<Fallback/>}>
                <LoadAssets/>
            </Suspense>
        </Scene>
    )
}
