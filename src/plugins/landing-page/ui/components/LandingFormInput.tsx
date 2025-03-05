import React, { useEffect, useRef, useCallback } from "react";
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

    useEffect(() => {
        if (!editorContainerRef.current || editorRef.current) return;

        // Initialize GrapesJS Editor only once
        editorRef.current = grapesjs.init({
            container: editorContainerRef.current,
            height: "600px",
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
            }
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
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, []); // Load once on mount

    // Load GrapesJS CSS
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/grapesjs/dist/css/grapes.min.css";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // const saveContent = useCallback(() => {
    //     if (editorRef.current) {
    //         setFormValue(editorRef.current.getHtml());
    //         console.log("Saved Content:", editorRef.current.getHtml());
    //     }
    // }, [setFormValue]);

    const saveContent = useCallback(() => {
        if (editorRef.current) {
            const html = editorRef.current.getHtml();
            const css = editorRef.current.getCss();
            
            // Combine HTML and CSS
            const fullContent = `
                <style>${css}</style>
                ${html}
            `;
            
            setFormValue(fullContent);
            console.log("Saved Content:", fullContent);
        }
    }, [setFormValue]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "auto" }}>
            <div style={{ display: "flex", height: "600px" }}>
                {/* Left Panel */}
                <div className="panel__left" style={{ width: "250px", background: "#f5f5f5", overflow: "auto" }}></div>

                {/* Editor Canvas */}
                <div ref={editorContainerRef} style={{ flex: 1, height: "100%", overflow: "auto" }}></div>

                {/* Right Panel */}
                <div className="panel__right" style={{ width: "250px", background: "#f5f5f5", overflow: "auto" }}></div>
            </div>

            {/* Block Manager Panel */}
            <div id="blocks" style={{ background: "#eaeaea", padding: "10px", minHeight: "100px" }}></div>

            {/* Save Button */}
            <button onClick={saveContent}>Save Page</button>
        </div>
    );
}
