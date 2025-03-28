import React, { useEffect, useRef, useCallback } from "react";
import { PlasmicCanvasHost } from "@plasmicapp/host";
import { initPlasmicLoader } from "@plasmicapp/loader-react";
import { useFormControl, ReactFormInputOptions } from "@vendure/admin-ui/react";

export const PLASMIC = initPlasmicLoader({
    projects: [
      {
        id: "agv5BFKSUKUxVAkxFHNTMa",  // ID of a project you are using
        token: "oLvGBN0oX82FYwepUDjI4EyVbBHMJSEvWojGvlvAEbhHCIBNIVHqH3Ve3NOhJGp5Rj008tj3r45SWl5x4BPA"  // API token for that project
      }
    ],
    // Fetches the latest revisions, whether or not they were unpublished!
    // Disable for production to ensure you render only published changes.
    preview: true,
  })

export default function LandingFormInput({ config }: ReactFormInputOptions) {
  const { value, setFormValue } = useFormControl();
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value && editorContainerRef.current) {
      // Load saved HTML content into the editor if exists
      editorContainerRef.current.innerHTML = value;
    }
  }, [value]);

  const saveContent = useCallback(() => {
    if (editorContainerRef.current) {
      const html = editorContainerRef.current.innerHTML;
      setFormValue(html);
      console.log("Saved Content:", html);
    }
  }, [setFormValue]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "auto" }}>
      {/* Editor Container */}
      <div ref={editorContainerRef} style={{ flex: 1, minHeight: "600px" }}>
        <PlasmicCanvasHost />
      </div>

      {/* Save Button */}
      <button onClick={saveContent}>Save Page</button>
    </div>
  );
}
