import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export const LandingPageEditor: React.FC = () => {
    const [content, setContent] = useState('');

    const handleEditorChange = (content: string) => {
        setContent(content);
    };

    return (
        <div>
            <Editor
                initialValue="<p>Initial content</p>"
                init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar:
                        'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help'
                }}
                onEditorChange={handleEditorChange}
            />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: '100%', height: '150px' }}
            />
        </div>
    );
};
