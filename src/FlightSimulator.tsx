import React, {Suspense} from "react"
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
import {MeshAssetTask, TextureAssetTask} from "@babylonjs/core"
import "@babylonjs/inspector"

const textureAssets: Task[] = [
    { taskType: TaskType.Texture, url: "assets/textures/earth.jpeg", name: "earth" },
    { taskType: TaskType.Texture, url: "assets/textures/worldHeightMap.jpeg", name: "world-height-map" },
    { taskType: TaskType.Mesh, rootUrl: "assets/models/f15/", sceneFilename: "f15.gltf", name: "airplane-model" },
]

function FlightSimulator(): JSX.Element {
    const scene = useScene()
    if (scene) {
        scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))
    }

    const assetManagerResult = useAssetManager(textureAssets, {
        useDefaultLoadingScreen: true,
        reportProgress: true,
    })

    const initialAirplanePosition = new Vector3(0, 10, 10)
    const initialAirplaneRotation = new Vector3(Math.PI / 16, Math.PI * (7/8), 0)

    const airplaneModelTask = assetManagerResult.taskNameMap["airplane-model"] as MeshAssetTask
    const airplane = airplaneModelTask.loadedMeshes[0]
    airplane.position = initialAirplanePosition
    airplane.rotation = initialAirplaneRotation

    const sunPosition = new Vector3(0, 30, 10)
    const SpeedFactor = 0.02

    useBeforeRender(() => {
        if (scene) {
            const deltaTimeInMillis = scene.getEngine().getDeltaTime()

            const airplaneModelTask = assetManagerResult.taskNameMap["airplane-model"] as MeshAssetTask
            const airplane = airplaneModelTask.loadedMeshes[0]

            const forward = new Vector3(0, 0, 1)
            const direction = airplane.getDirection(forward).scale(deltaTimeInMillis * SpeedFactor)

            airplane.position.addInPlace(direction)
        }
    })

    return (
        <>
            <hemisphericLight name='hemi-light' intensity={0.1} direction={Vector3.Up()} />

            <pointLight
                name="point-light"
                position={sunPosition}
                diffuse={new Color3(1, 1, 1)}
                specular={new Color3(0, 0, 0)}
            />

            <sphere
                name="sun"
                position={sunPosition}
                segments={10}
                diameter={4}
            >
                <standardMaterial
                    name="sun-material"
                    emissiveColor={new Color3(1, 1, 0)}
                />
            </sphere>

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

export function TerrainScene(): JSX.Element {
    return (
        <Scene>
            <arcRotateCamera
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

            <Suspense fallback={null}>
                <FlightSimulator/>
            </Suspense>
        </Scene>
    )
}
