import {Controls} from "./controls"
import {
    AbstractMesh,
    Vector3
} from "@babylonjs/core"
import {loadMesh, MeshSet} from "./loading"
import {Mesh} from "@babylonjs/core/Meshes/mesh"

export const loadAirplane = (): Promise<MeshSet<Mesh>> => loadMesh(
    "f15 task",
    ["F_15_C", "GLass", "TAnks"],
    "assets/models/f15/",
    "f15.gltf",
    new Vector3(120, 60, 200),
    new Vector3(0, Math.PI * (7 / 8), 0),
    new Vector3(1, 1, 1),
)

// Ideally, we would take airplane position & rotation and return new position & rotation to make this a
// pure, testable function.
export function updateAirplane(airplane: AbstractMesh, deltaTime: number, controls: Controls): void {
    const rotationAmount = Math.PI * deltaTime * 0.001

    airplane.rotate(new Vector3(0, 0, -1), rotationAmount * controls.roll)

    const RudderFactor = 0.1
    airplane.rotate(new Vector3(0, 1, 0), rotationAmount * RudderFactor * controls.rudder)

    if (controls.pitch < 0) { // we can pitch down worse than we can pitch up
        airplane.rotate(new Vector3(-1, 0, 0), rotationAmount * controls.pitch * 0.05)
    } else if (controls.pitch > 0) {
        airplane.rotate(new Vector3(-1, 0, 0), rotationAmount * controls.pitch * 0.4)
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
