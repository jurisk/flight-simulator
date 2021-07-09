import React from "react"

interface NesBalloonProps {
    children: string,
}

export const NesRightBalloon: (props: NesBalloonProps) => JSX.Element = (props: NesBalloonProps) => (
    <section className="message-right">
        <div className="nes-balloon from-right">
            <p>{props.children}</p>
        </div>
    </section>
)

export const NesLeftBalloon: (props: NesBalloonProps) => JSX.Element = (props: NesBalloonProps) => (
    <section className="message-left">
        <div className="nes-balloon from-left">
            <p>{props.children}</p>
        </div>
    </section>
)
