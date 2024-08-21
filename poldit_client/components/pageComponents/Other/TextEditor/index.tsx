import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Editor, IAllProps } from "@tinymce/tinymce-react";
import * as tinymce from "tinymce";
import FileDrop from "../FileDrop";

const TINY_KEY = process.env.NEXT_PUBLIC_TINY_KEY ?? "";

const CustomEditor = ({ initialValue, limit }: any) => {
  const sizeLimit = limit ?? 500;
  const editorRef = useRef(null);

  const { isOpen, onToggle, onClose } = useDisclosure();

  const [value, setValue] = useState(initialValue ?? "");
  const [length, setLength] = useState(0);

  const handleInit = (evt: any, editor: tinymce.Editor) => {
    setLength(editor.getContent({ format: "text" }).length);
  };

  const log = () => {
    if (editorRef.current) {
      console.log((editorRef as any).current.getContent());
    }
  };

  const handleFiles = (cb: any, value: any, meta: any) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.addEventListener("change", (e: any) => {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        /*
          Note: Now we need to register the blob in TinyMCEs image blob
          registry. In the next release this part hopefully won't be
          necessary, as we are looking to handle it internally.
        */
        // const id = "blobid" + new Date().getTime();
        // const blobCache = tinymce.activeEditor.editorUpload.blobCache;
        // const base64 = reader.result.split(",")[1];
        // const blobInfo = blobCache.create(id, file, base64);
        // blobCache.add(blobInfo);
        /* call the callback and populate the Title field with the file name */
        // cb(blobInfo.blobUri(), { title: file.name });
      });
      reader.readAsDataURL(file);
    });
  };

  const handleEditorChange = (val: string, editor: tinymce.Editor) => {
    const length = editor.getContent({ format: "text" }).length;
    if (length <= sizeLimit) {
      setValue(val);
      setLength(length);
    }
  };

  const handleBeforeAddUndo = (evt: any, editor: tinymce.Editor) => {
    const length = editor.getContent({ format: "text" }).length;
    if (length > sizeLimit) {
      evt.preventDefault();
    }
  };

  const editorSetUp = (e: tinymce.Editor) => {
    e.ui.registry.addButton("myImgBtn", {
      icon: "image",
      onAction: () => onToggle(),
    });
  };

  const addMedia = (urlType: string, files: any) => {
    console.log("triggered");
  };

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  return (
    <Box>
      <Popover
        isLazy
        returnFocusOnClose={false}
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <Box />
        </PopoverTrigger>
        <Editor
          apiKey={TINY_KEY}
          onInit={handleInit}
          initialValue={initialValue}
          value={value}
          onEditorChange={handleEditorChange}
          onBeforeAddUndo={handleBeforeAddUndo}
          init={{
            placeholder: "Type Here...",
            statusbar: false,
            branding: false,
            height: 500,
            menubar: false,
            images_file_types: "jpg,svg,webp",
            plugins: ["lists", "image", "link", "autolink", "media"],
            toolbar:
              "bold italic underline myImgBtn  | undo redo | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
            file_picker_types: "image",
            file_picker_callback: handleFiles,
            setup: editorSetUp,
          }}
        />
        <FileDrop maxFiles={3} close={onClose} addMedia={addMedia} />
      </Popover>
      <p>Remaining: {sizeLimit - length}</p>
      <Button onClick={log}>Log editor content</Button>
    </Box>
  );
};

export default CustomEditor;
