import {Color3} from "@babylonjs/core/Maths/math.color"
import {
    GroundMesh,
    HemisphericLight,
    MeshBuilder,
    PointLight,
    Scene,
    Scene as BabylonScene, StandardMaterial,
    Vector3
} from "@babylonjs/core"
import {Texture} from "@babylonjs/core/Materials/Textures/texture"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"

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

/* Hack because 'getHeightAtCoordinates' fails with 'physicsImpostor' set */
export function loadMapWithPhysics(scene: Scene): Promise<GroundMesh> {
    return loadMap(scene)
        .then((map) => {
            map.physicsImpostor = new PhysicsImpostor(map, PhysicsImpostor.HeightmapImpostor, {mass: 0})
            return map
        })
}

export function loadMap(scene: Scene): Promise<GroundMesh> {
    return new Promise<GroundMesh>((resolve) => {
        const mapMaterial = new StandardMaterial("map-material", scene)
        mapMaterial.diffuseTexture = new Texture("assets/textures/earth.jpeg", scene)

        MeshBuilder.CreateGroundFromHeightMap("map", "assets/textures/worldHeightMap.jpeg", {
            width: EdgeLength,
            height: EdgeLength,
            subdivisions: 250,
            minHeight: 0,
            maxHeight: MaxHeight,
            updatable: false,
            onReady: (map) => {
                map.material = mapMaterial
                map.isPickable = true
                map.updateCoordinateHeights()
                console.log("GroundMesh loaded", map)
                resolve(map)
            }
        }, scene)
    })
}
