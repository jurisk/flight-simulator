import React, {Suspense, useRef} from "react"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {Color3} from "@babylonjs/core/Maths/math.color"
import {Scene, Task, TaskType, useAssetManager, useBeforeRender, useScene} from "react-babylonjs"
import {TextureAssetTask, Texture} from "@babylonjs/core"
import {Nullable} from "@babylonjs/core/types"
import {Mesh} from "@babylonjs/core/Meshes/mesh"
import "@babylonjs/inspector"

const textureAssets: Task[] = [
    { taskType: TaskType.Texture, url: "assets/textures/earth.jpeg", name: "earth" },
    { taskType: TaskType.Texture, url: "assets/textures/worldHeightMap.jpeg", name: "world-height-map" },
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

    const sunPosition = new Vector3(0, 30, 10)

    const sunRef = useRef<Nullable<Mesh>>(null)
    const pointLightRef = useRef<Nullable<Mesh>>(null)

    useBeforeRender(() => {
        if (sunRef?.current && pointLightRef?.current) {
            const sun = sunRef.current
            const pointLight = pointLightRef.current

            sun.position = pointLight.position
            pointLight.position.x -= 0.5
            if (pointLight.position.x < -90)
                pointLight.position.x = 100
        }
    })

    return (
        <>
            <hemisphericLight name='hemi-light' intensity={0.1} direction={Vector3.Up()} />

            <pointLight
                name="point-light"
                ref={pointLightRef}
                position={sunPosition}
                diffuse={new Color3(1, 1, 1)}
                specular={new Color3(0, 0, 0)}
            />
            <sphere
                name="sun"
                ref={sunRef}
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


            {/*<Skybox rootUrl="assets/textures/TropicalSunnyDay" />*/}

            <box
                name="sky-box"
                size={800}
            >
                <standardMaterial
                    name="sky-box-material"
                    backFaceCulling={false}
                    diffuseColor={new Color3(0, 0, 0)}
                    specularColor={new Color3(0, 0, 0)}
                    disableLighting={true}
                >
                    <cubeTexture
                        rootUrl="assets/textures/skybox"
                        coordinatesMode={Texture.SKYBOX_MODE}
                        assignTo="reflectionTexture"
                    />
                </standardMaterial>
            </box>
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
