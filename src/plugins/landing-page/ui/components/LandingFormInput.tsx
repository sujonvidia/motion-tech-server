import React, { useEffect, useRef, useCallback, useState } from "react";
import grapesjs from "grapesjs";
import gjsPresetWebpage from "grapesjs-preset-webpage";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import grapesjsPluginForms from "grapesjs-plugin-forms";
import grapesjsPluginExport from "grapesjs-plugin-export";
import { useFormControl, ReactFormInputOptions } from "@vendure/admin-ui/react";

export default function LandingFormInput({ config }: ReactFormInputOptions) {
    const { value, setFormValue } = useFormControl();
    const editorRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (!editorContainerRef.current) return;

        // Initialize GrapesJS Editor
        editorRef.current = grapesjs.init({
            container: editorContainerRef.current,
            height: fullscreen ? "100vh" : "600px",
            // fromElement: true,
            storageManager: false,
            plugins: [
                gjsPresetWebpage,
                grapesjsBlocksBasic,
                grapesjsPluginForms,
                grapesjsPluginExport
            ],
            canvas: {
                styles: [
                    "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css",
                    "https://fonts.googleapis.com/css?family=Roboto"
                ]
            },
            // panels: {
            //     defaults: [
            //         {
            //             id: "layers-panel",
            //             el: ".panel__left",
            //             resizable: { maxDim: 350, minDim: 200, cl: true }
            //         },
            //         {
            //             id: "styles-panel",
            //             el: ".panel__right",
            //             resizable: { maxDim: 350, minDim: 200, cr: true }
            //         }
            //     ]
            // },
            // layerManager: { appendTo: ".panel__left" }, 
            // selectorManager: { appendTo: ".panel__right" },
            // styleManager: { appendTo: ".panel__right" },
            // blockManager: { appendTo: "#blocks" }
        });

        // Load saved content into editor
        if (value) {
            editorRef.current.setComponents(value);
        }

        // Listen for changes and update form
        editorRef.current.on("component:update", () => {
            setFormValue(editorRef.current.getHtml());
        });

        return () => {
            if (editorRef.current) editorRef.current.destroy();
        };
    }, [value, setFormValue, fullscreen]);

    // Load GrapesJS CSS
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/grapesjs/dist/css/grapes.min.css";
        document.head.appendChild(link);

        return () => {
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, []);

    const saveContent = useCallback(() => {
        if (editorRef.current) {
            setFormValue(editorRef.current.getHtml());
            console.log("Saved Content:", editorRef.current.getHtml());
        }
    }, [setFormValue]);

    const toggleFullscreen = () => setFullscreen(!fullscreen);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: fullscreen ? "100vh" : "auto" }}>
            {/* GrapesJS Editor Layout */}
            <div style={{ display: "flex", height: fullscreen ? "100vh" : "600px" }}>
                {/* Left Panel (Layers Manager) */}
                <div className="panel__left" style={{ width: "250px", background: "#f5f5f5", overflow: "auto" }}></div>

                {/* Editor Canvas */}
                <div ref={editorContainerRef} style={{ flex: 1, height: "100%", overflow: "auto" }}></div>

                {/* Right Panel (Style Manager & Selector Manager) */}
                <div className="panel__right" style={{ width: "250px", background: "#f5f5f5", overflow: "auto" }}></div>
            </div>

            {/* Block Manager Panel (Bottom) */}
            <div id="blocks" style={{ background: "#eaeaea", padding: "10px", minHeight: "100px" }}></div>

            {/* Controls */}
            <button onClick={toggleFullscreen} style={{ position: "absolute", top: "10px", right: "10px" }}>
                {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
            <button onClick={saveContent}>Save Page</button>
        </div>
    );
}
