import React from "react"

interface ErrorBoundaryProps {
    children: React.Component[],
}

export class ErrorBoundary extends React.Component {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error(error, info)
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        // eslint-disable-next-line react/prop-types
        return this.props.children
    }
}
