import React, { useEffect, useRef } from 'react';
import createStudioEditor from '@grapesjs/studio-sdk';
import '@grapesjs/studio-sdk/style';

interface LandingFormInputProps {
  projectId: string;
  userId: string;
}

const LandingFormInput: React.FC<LandingFormInputProps> = ({ projectId, userId }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Initialize the Studio Editor once the DOM is rendered
      createStudioEditor({
        root: '#studio-editor', // This refers to the DOM element where the editor will be attached
        licenseKey: '4a12d5e8d5d54cb59328f9147473e291e6aac25aa347436883500be95ee9d5a5',
        project: {
          type: 'web',
          id: projectId, // Use the projectId prop passed from parent component
        },
        identity: {
          id: userId, // Use the userId prop passed from parent component
        },
        assets: {
          storageType: 'cloud',
        },
        storage: {
          type: 'cloud',
          autosaveChanges: 100,
          autosaveIntervalMs: 10000,
        },
      });
    }
  }, [projectId, userId]);

  return (
    <div>
      {/* The div where the editor will be mounted */}
      <div id="studio-editor" ref={editorRef} style={{ height: '500px' }}></div>
      <button onClick={() => console.log('Save Content')}>Save Page</button>
    </div>
  );
};

export default LandingFormInput;
