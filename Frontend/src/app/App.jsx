import './App.css'
import {Editor} from "@monaco-editor/react";


function App() {
  return (
    <main className="app-shell">
      <aside className="panel panel-light" aria-label="left panel">
        <div className="panel-inner panel-inner-light" />
      </aside>

      <section className="panel panel-dark" aria-label="main canvas">
        <div className="canvas-grid" />

        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some code..."
        />
      </section>
    </main>
  )
}

export default App
