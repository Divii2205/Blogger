import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import Button from "./ui/Button";

const FILTER_DEFAULTS = { brightness: 100, contrast: 100, saturation: 100 };

// Renders the cropped pixel area through the chosen CSS filters into a
// canvas, then exports a JPEG blob. We do this client-side instead of
// shipping filter intents to the server so the upload endpoint stays a
// dumb pass-through to Cloudinary.
const drawCroppedImage = (image, croppedAreaPixels, filters) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode cropped image"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });

const ImageEditor = ({ file, aspect = 16 / 9, onConfirm, onCancel }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [processing, setProcessing] = useState(false);
  const croppedAreaRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_, areaPixels) => {
    croppedAreaRef.current = areaPixels;
  }, []);

  const handleConfirm = async () => {
    if (!imageUrl || !croppedAreaRef.current) return;
    setProcessing(true);
    try {
      const image = await loadImage(imageUrl);
      const blob = await drawCroppedImage(image, croppedAreaRef.current, filters);
      const editedFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
      onConfirm(editedFile);
    } catch (error) {
      console.error("Image edit failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Edit image
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-neutral-950 h-80 sm:h-96">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{ mediaStyle: filterStyle }}
            />
          )}
        </div>

        <div className="p-4 space-y-3 border-t border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>Zoom</span>
              <span className="text-xs text-neutral-500">{zoom.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {[
            { key: "brightness", label: "Brightness" },
            { key: "contrast", label: "Contrast" },
            { key: "saturation", label: "Saturation" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <span>{label}</span>
                <span className="text-xs text-neutral-500">{filters[key]}%</span>
              </label>
              <input
                type="range"
                min={50}
                max={150}
                step={1}
                value={filters[key]}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="p-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setZoom(1);
              setCrop({ x: 0, y: 0 });
              setFilters(FILTER_DEFAULTS);
            }}
          >
            Reset
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={processing}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirm} loading={processing}>
              Use this image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
