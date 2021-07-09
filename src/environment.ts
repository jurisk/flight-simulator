import {Color3} from "@babylonjs/core/Maths/math.color"
import {
    GroundMesh,
    HemisphericLight, LinesBuilder,
    MeshBuilder,
    PointLight, Ray,
    Scene,
    Scene as BabylonScene, StandardMaterial,
    Vector3
} from "@babylonjs/core"
import {Texture} from "@babylonjs/core/Materials/Textures/texture"
import {Nullable} from "@babylonjs/core/types"
import {isDebug} from "./util"

export function fogSkyLight(scene: Scene): void {
    const SkyBlue = Color3.FromHexString("#77B5FE")
    scene.clearColor = SkyBlue.toColor4(1)
    scene.fogEnabled = true
    scene.fogMode = BabylonScene.FOGMODE_EXP2
    scene.fogDensity = 0.002
    scene.fogColor = SkyBlue

    new PointLight("directional-light", new Vector3(-1, -1, 0), scene)

    const hemiLight = new HemisphericLight("hemi-light", new Vector3(0, 1, 0), scene)
    hemiLight.intensity = 0.25
}

export const EdgeLength = 1000
export const MaxCoordinate = EdgeLength / 2
export const MinCoordinate = -MaxCoordinate

export const MaxHeight = 100

export function loadMap(scene: Scene): Promise<GroundMesh> {
    return new Promise<GroundMesh>((resolve) => {
        const map = MeshBuilder.CreateGroundFromHeightMap("map", "assets/textures/worldHeightMap.jpeg", {
            width: EdgeLength,
            height: EdgeLength,
            subdivisions: 256,
            minHeight: 0,
            maxHeight: MaxHeight,
            updatable: false,
            onReady: (x) => {
                console.log("GroundMesh loaded", x)
                resolve(x)
            }
        }, scene)
        const mapMaterial = new StandardMaterial("map-material", scene)
        mapMaterial.diffuseTexture = new Texture("assets/textures/earth.jpeg", scene)
        map.material = mapMaterial
    })
}

export function getHeightAtOctreeGroundCoordinates(scene: Scene, from: Vector3): Nullable<number> {
    const origin = new Vector3(from.x, MaxHeight, from.z)
    const down = new Vector3(0, -1, 0)

    const ray = new Ray(origin, down)
    const hit = scene.pickWithRay(ray)

    // console.log(from, hit?.pickedPoint)
    if (hit?.pickedPoint) {
        if (isDebug()) {
            const red = Color3.Red().toColor4(1)
            LinesBuilder.CreateLines("line", {points: [origin, hit?.pickedPoint], colors: [red, red]})
        }

        return hit.pickedPoint.y
    } else {
        return null
    }
}
