import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"

export const isDebug: () => boolean = () =>
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")

export type CollisionCallback = (collider: PhysicsImpostor, collidedWith: PhysicsImpostor) => void
