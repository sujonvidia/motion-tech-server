// import React from 'react';
import React, { useCallback , useRef} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useFormControl, ReactFormInputOptions } from '@vendure/admin-ui/react';
import { Editor as TinyMCEEditor } from 'tinymce';
// import tinymce from 'tinymce';
// import 'tinymce/icons/default';
// import 'tinymce/themes/silver';
// import 'tinymce/plugins/advlist';
// import 'tinymce/plugins/autolink';
// import 'tinymce/plugins/lists';
// import 'tinymce/plugins/link';
// import 'tinymce/plugins/image';
// import 'tinymce/plugins/charmap';
// import 'tinymce/plugins/print';
// import 'tinymce/plugins/preview';
// import 'tinymce/plugins/anchor';
// import 'tinymce/plugins/searchreplace';
// import 'tinymce/plugins/visualblocks';
// import 'tinymce/plugins/code';
// import 'tinymce/plugins/fullscreen';
// import 'tinymce/plugins/insertdatetime';
// import 'tinymce/plugins/media';
// import 'tinymce/plugins/table';
// import 'tinymce/plugins/paste';
// import 'tinymce/plugins/help';
// import 'tinymce/plugins/wordcount';

export function LandingFormInput({ config }: ReactFormInputOptions) {
    const { value, setFormValue } = useFormControl();
    // const editorRef = useRef(null);
    const editorRef = useRef<TinyMCEEditor | null>(null);

    // const handleEditorChange = (content: string) => {
    //     setFormValue(content);
    // };
    const handleEditorChange = useCallback((content: string) => {
        setFormValue(content);
    }, [setFormValue]);

    const log = () => {
        if (editorRef.current) {
          console.log(editorRef.current.getContent());
          setFormValue(editorRef.current.getContent())
        }
      };

    return (
        <>
        <Editor
        apiKey='d1hzqw9ym2dak60p72jjeq0iqypm8vtd44xtzwhv05kkp9r7'
        onInit={(_evt, editor) => editorRef.current = editor}
        // onEditorChange={handleEditorChange}
        initialValue={value}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
      <button onClick={log}>Save editor content</button>
      </>
        // <Editor
        //     apiKey='d1hzqw9ym2dak60p72jjeq0iqypm8vtd44xtzwhv05kkp9r7'
        //     initialValue={value}
        //     // init={{
        //     //     height: 500,
        //     //     menubar: true,
        //     //     plugins: [
        //     //         'advlist autolink lists link image charmap print preview anchor',
        //     //         'searchreplace visualblocks code fullscreen',
        //     //         'insertdatetime media table paste code help wordcount',
        //     //         'media',
        //     //         'image',
        //     //         'imagetools',
        //     //         'code',
        //     //     ],
        //     //     toolbar: 
        //     //         'undo redo | formatselect | bold italic backcolor | \
        //     //         alignleft aligncenter alignright alignjustify | \
        //     //         bullist numlist outdent indent | removeformat | help | \
        //     //         media image | code',
        //     //     image_title: true,
        //     //     automatic_uploads: true,
        //     //     file_picker_types: 'image media',
        //     //     file_picker_callback: function (cb, value, meta) {
        //     //         let input = document.createElement('input');
        //     //         input.setAttribute('type', 'file');
        //     //         input.setAttribute('accept', meta.filetype === 'image' ? 'image/*' : 'media/*');

        //     //         input.onchange = function () {
        //     //             if (input.files && input.files.length > 0) {
        //     //                 let file = input.files[0];
        //     //                 let reader = new FileReader();
        //     //                 reader.onload = function () {
        //     //                     if (tinymce.activeEditor) { // Null check for activeEditor
        //     //                         if (typeof reader.result === 'string') { // Ensure reader.result is a string
        //     //                             let id = 'blobid' + (new Date()).getTime();
        //     //                             let blobCache = tinymce.activeEditor.editorUpload.blobCache;
        //     //                             let base64 = reader.result.split(',')[1];
        //     //                             let blobInfo = blobCache.create(id, file, base64);
        //     //                             blobCache.add(blobInfo);
        //     //                             cb(blobInfo.blobUri(), { title: file.name });
        //     //                         } else {
        //     //                             console.error('FileReader result is not a string.');
        //     //                         }
        //     //                     } else {
        //     //                         console.error('Editor is not available.');
        //     //                     }
        //     //                 };
        //     //                 reader.readAsDataURL(file);
        //     //             }
        //     //         };

        //     //         input.click();
        //     //     },
        //     //     ...config, // Spread any additional config passed in
        //     // }}
        //     init={{
        //         height: 500,
        //         menubar: true,
        //         plugins: [
        //           'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        //           'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        //           'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        //         ],
        //         toolbar: 'undo redo | blocks | ' +
        //           'bold italic forecolor | alignleft aligncenter ' +
        //           'alignright alignjustify | bullist numlist outdent indent | ' +
        //           'removeformat | help',
        //         content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        //       }}
        //     onEditorChange={handleEditorChange}
        // />
    );
}
