import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { storageFileSchema } from "@superstreamer/api/client";
import type { StorageFile } from "@superstreamer/api/client";
import useSWR from "swr";
import { useApi } from "../api";
import { ObjView } from "./ObjView";

interface FilePreviewProps {
  path: string | null;
  onClose(): void;
}

export function FilePreview({ path, onClose }: FilePreviewProps) {
  const { api } = useApi();
  const { data } = useSWR(["file-preview", path], async ([_, path]) => {
    if (!path) {
      return null;
    }

    const response = await api.storage.file.$get({ query: { path } });
    const data = await response.json();
    return storageFileSchema.parse(data);
  });

  return (
    <Modal
      isOpen={path !== null}
      onClose={onClose}
      scrollBehavior="outside"
      size="4xl"
    >
      <ModalContent>
        <ModalBody className="p-6">
          {path ? (
            <div className="text-sm">
              <PathName path={path} />
            </div>
          ) : null}
          {data ? (
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <Preview file={data} />
            </div>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Preview({ file }: { file: StorageFile }) {
  if (file.mode === "payload") {
    return <ObjView data={file.payload} />;
  }
  if (file.mode === "url") {
    if (file.type === "video") {
      return (
        // biome-ignore lint/a11y/useMediaCaption: No caption
        <video src={file.url} controls className="w-full max-w-lg mx-auto" />
      );
    }
    if (file.type === "audio") {
      return (
        // biome-ignore lint/a11y/useMediaCaption: No caption
        <audio src={file.url} controls className="w-full max-w-lg mx-auto" />
      );
    }
  }
  return null;
}

function PathName({ path }: { path: string }) {
  const chunks = path.substring(1).split("/");
  return (
    <div className="flex gap-1">
      {chunks.map((chunk, index) => {
        return (
          <div key={index}>
            <span>{chunk}</span>
            {index < chunks.length - 1 ? (
              <span className="opacity-50">/</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
