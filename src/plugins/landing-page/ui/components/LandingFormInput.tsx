import React, { useEffect, useRef, useCallback } from "react";
import grapesjs from "grapesjs";
// ✅ Import the preset plugin
import gjsPresetWebpage from "grapesjs-preset-webpage"; // ✅ Import the preset plugin
import grapesjsBlocksBasic from "grapesjs-blocks-basic"; // Import the basic blocks plugin
import grapesjsPluginForms from "grapesjs-plugin-forms"; // Import the forms plugin
import grapesjsPluginExport from "grapesjs-plugin-export"; // Import the export plugin
import { useFormControl, ReactFormInputOptions } from "@vendure/admin-ui/react";

export function LandingFormInput({ config }: ReactFormInputOptions) {
    const { value, setFormValue } = useFormControl();
    const editorRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    // Initialize GrapesJS Editor
    useEffect(() => {
        if (!editorContainerRef.current) return;

        editorRef.current = grapesjs.init({
            container: editorContainerRef.current,
            height: "500px",
            fromElement: true,
            storageManager: false, // Disable built-in storage
            plugins: [
                gjsPresetWebpage, // Include the webpage plugin
                grapesjsBlocksBasic, // Include basic blocks plugin
                grapesjsPluginForms, // Include forms plugin
                grapesjsPluginExport // Include export plugin
            ], // ✅ Include the webpage plugin
            canvas: {
                styles: [
                    "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css",
                    "https://fonts.googleapis.com/css?family=Roboto"
                ]
            },
        });

        // Load initial content if exists
        if (value) {
            editorRef.current.setComponents(value);
        }

        // Handle editor content changes
        editorRef.current.on("update", () => {
            setFormValue(editorRef.current?.getHtml());
        });

    }, [setFormValue]);

    useEffect(() => {
        // ✅ Dynamically inject CSS for GrapesJS styles
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // Save content from editor
    const saveContent = useCallback(() => {
        if (editorRef.current) {
            setFormValue(editorRef.current.getHtml());
            console.log("Saved Content:", editorRef.current.getHtml());
        }
    }, [setFormValue]);

    return (
        <>
            <div ref={editorContainerRef}></div> {/* Main editor container */}
            <button onClick={saveContent}>Save Page</button>
        </>
    );
}
