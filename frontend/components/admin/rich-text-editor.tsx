"use client"

import React, { useEffect, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [Quill, setQuill] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-quill-new').then((module) => {
        setQuill(() => module.default);
      });
    }
  }, []);

  if (!Quill) {
    return <div>Yükleniyor...</div>;
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="rich-text-editor">
      <Quill
        value={value}
        onChange={onChange}
        theme="snow"
        modules={modules}
      />
    </div>
  );
};

export default RichTextEditor; 