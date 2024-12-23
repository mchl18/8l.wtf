import React from "react";
import { Button } from "./ui/button";
import { ClipboardIcon } from "lucide-react";

// this should be just a mutate function
const PasteButton = ({
  onPaste,
  onError,
}: {
  onPaste: (text: string) => void;
  onError?: (error: string) => void;
}) => {
  const handlePaste = async () => {
    try {
      // Check if we have clipboard-read permission
      const permissionStatus = await navigator.permissions.query({
        name: "clipboard-read" as PermissionName,
      });

      if (permissionStatus.state === "denied") {
        throw new Error("Clipboard permission denied");
      }

      // Read from clipboard
      const text = await navigator.clipboard.readText();
      onPaste(text);
    } catch (err) {
      const error = (err as Error).message || err;
      onError?.(error as string);
    }
  };

  return (
    <Button
      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black px-2 flex-1 md:w-auto"
      variant="outline"
      type="button"
      onClick={handlePaste}
    >
      <ClipboardIcon className="w-4 h-4" />
    </Button>
  );
};

export { PasteButton };
