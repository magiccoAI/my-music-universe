import React from 'react';
import { Html } from '@react-three/drei';

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Scene Error:", error, errorInfo);
    // Here you could also log to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      // Return a fallback UI that renders inside the Canvas (using Html) or just null to hide the broken part
      return (
        <group>
            {/* Fallback simple light so the scene isn't pitch black if lights fail */}
            <ambientLight intensity={0.5} color="#444" />
            <Html center>
                <div className="bg-black/80 text-white p-4 rounded-lg border border-red-500/50 backdrop-blur-md max-w-xs text-center">
                    <h3 className="text-sm font-bold text-red-400 mb-1">渲染异常</h3>
                    <p className="text-xs text-gray-300">
                        傍晚特效暂时无法加载。
                        <br/>
                        已自动降级以保证浏览体验。
                    </p>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                    >
                        重试
                    </button>
                </div>
            </Html>
        </group>
      );
    }

    return this.props.children;
  }
}

export default SceneErrorBoundary;