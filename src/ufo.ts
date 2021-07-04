import {AbstractMesh, AssetsManager} from "@babylonjs/core"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {loadMesh} from "./loading"

export function loadUfo(
    assetsManager: AssetsManager,
    loaded: (mesh: AbstractMesh) => void,
): void {
    loadMesh(
        assetsManager,
        "ufo task",
        ["UFO_body", "UFO_cockpit"],
        "assets/models/ufo/",
        "ufo.glb",
        new Vector3(60, 40, 60),
        new Vector3(0, 0, 0),
        new Vector3(0.1, 0.1, 0.1),
        loaded,
    )
}

export function updateUfo(ufo: AbstractMesh, delta: number): void {
    // TODO: move in circles
    const velocity = 0.01
    ufo.position.addInPlace(new Vector3(velocity * delta, 0, velocity * delta))
}
