import {AbstractMesh, AssetsManager} from "@babylonjs/core"
import {Vector3} from "@babylonjs/core/Maths/math.vector"

export function loadUfo(
    assetsManager: AssetsManager,
    loaded: (mesh: AbstractMesh) => void,
): void {
    const initialUfoPosition = new Vector3(20, 20, 20)
    const initialUfoRotation = new Vector3(0, 0, 0)

    const ufoTask = assetsManager.addMeshTask(
        "ufo task",
        ["UFO_body", "UFO_cockpit"],
        "assets/models/ufo/",
        "ufo.glb",
    )

    ufoTask.onSuccess = task => {
        const ufo = task.loadedMeshes[0]
        ufo.scaling = new Vector3(0.1, 0.1, 0.1)
        ufo.position = initialUfoPosition
        ufo.rotation = initialUfoRotation

        loaded(ufo)
    }
    ufoTask.onError = (task, error) => console.error(task, error)
}

export function updateUfo(ufo: AbstractMesh, delta: number): void {
    // TODO: move in circles
    const velocity = 0.01
    ufo.position.addInPlace(new Vector3(velocity * delta, 0, velocity * delta))
}
