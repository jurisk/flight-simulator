import {Controls} from "./controls"
import {AbstractMesh, AssetsManager, Vector3} from "@babylonjs/core"

export function loadAirplane(
    assetsManager: AssetsManager,
    loaded: (mesh: AbstractMesh) => void,
): void {
    const airplaneTask = assetsManager.addMeshTask(
        "f15 task",
        ["F_15_C", "GLass", "TAnks"],
        "assets/models/f15/",
        "f15.gltf",
    )

    const initialAirplanePosition = new Vector3(0, 10, 10)
    const initialAirplaneRotation = new Vector3(0, Math.PI * (7/8), 0)

    airplaneTask.onSuccess = task => {
        const airplane = task.loadedMeshes[0]
        airplane.position = initialAirplanePosition
        airplane.rotation = initialAirplaneRotation

        loaded(airplane)
    }

    airplaneTask.onError = (task, error) => console.error(task, error)
}

// Ideally, we would take airplane position & rotation and return new position & rotation to make this a
// pure, testable function.
export function updateAirplane(airplane: AbstractMesh, deltaTime: number, controls: Controls): void {
    const rotationAmount = Math.PI * deltaTime * 0.001

    airplane.rotate(new Vector3(0, 0, 1), rotationAmount * controls.roll)

    const RudderFactor = 0.2
    airplane.rotate(new Vector3(0, 1, 0), rotationAmount * RudderFactor * controls.rudder)

    if (controls.pitch < 0) { // we can pitch down worse than we can pitch up
        airplane.rotate(new Vector3(1, 0, 0), rotationAmount * controls.pitch * 0.05)
    } else if (controls.pitch > 0) {
        airplane.rotate(new Vector3(1, 0, 0), rotationAmount * controls.pitch * 0.4)
    }

    const forward = new Vector3(0, 0, 1)
    const SpeedFactor = 0.02

    // TODO: throttle isn't really speed, have to decouple and add inertia and stalling
    const direction = airplane
        .getDirection(forward)
        .scale(deltaTime * SpeedFactor * controls.throttle)

    // TODO: move to more advanced physics such as https://www.youtube.com/watch?v=p3jDJ9FtTyM / https://github.com/gasgiant/Aircraft-Physics
    airplane.position.addInPlace(direction)
}
