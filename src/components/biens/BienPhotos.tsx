"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addBienPhoto, removeBienPhoto } from "@/lib/actions";

export default function BienPhotos({
  bienId,
  photos: initialPhotos,
}: {
  bienId: string;
  photos: string[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const safeIndex = Math.min(current, Math.max(photos.length - 1, 0));

  const prev = () => setCurrent((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent((i) => (i + 1) % photos.length);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const newUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${bienId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("bien-photos")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(`Erreur upload : ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("bien-photos")
        .getPublicUrl(path);

      await addBienPhoto(bienId, urlData.publicUrl);
      newUrls.push(urlData.publicUrl);
    }

    setPhotos((prev) => [...prev, ...newUrls]);
    setCurrent(photos.length + newUrls.length - 1);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  };

  const handleDelete = (url: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const supabase = createClient();
        const path = new URL(url).pathname.split(
          "/object/public/bien-photos/"
        )[1];
        if (path) await supabase.storage.from("bien-photos").remove([path]);
        await removeBienPhoto(bienId, url);
        const next = photos.filter((p) => p !== url);
        setPhotos(next);
        setCurrent((i) => Math.min(i, Math.max(next.length - 1, 0)));
        router.refresh();
      } catch {
        setError("Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Carrousel ── */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <ImagePlus className="mx-auto mb-2 h-8 w-8 text-gray-200" />
          <p className="text-sm text-gray-400">Aucune photo pour ce bien</p>
          <p className="mt-1 text-xs text-gray-300">
            Cliquez sur &quot;Ajouter des photos&quot; pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image principale */}
          <div className="relative rounded-xl bg-gray-950 group flex items-center justify-center overflow-hidden" style={{ minHeight: 240 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[safeIndex]}
              alt={`Photo ${safeIndex + 1}`}
              className="max-h-[560px] max-w-full w-auto h-auto cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />

            {/* Compteur */}
            <div className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              {safeIndex + 1} / {photos.length}
            </div>

            {/* Bouton supprimer */}
            <button
              onClick={() => handleDelete(photos[safeIndex])}
              disabled={isPending}
              className="absolute top-3 right-3 rounded-lg bg-black/60 p-2 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Flèches */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Points */}
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === safeIndex
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bande de miniatures */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt={`Miniature ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-16 w-16 shrink-0 cursor-pointer rounded-lg object-contain bg-gray-900 transition-all ${
                    i === safeIndex
                      ? "ring-2 ring-brand-500 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Boutons upload ── */}
      <div className="flex flex-wrap gap-2">
        {/* Galerie / fichier */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {uploading ? "Upload en cours…" : "Depuis la galerie"}
        </button>

        {/* Caméra (mobile) */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 transition-colors"
        >
          <Camera className="h-4 w-4" />
          Prendre une photo
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(false)}
        >
          {/* Fermer */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Flèches lightbox */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Compteur lightbox */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {safeIndex + 1} / {photos.length}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[safeIndex]}
            alt={`Photo ${safeIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
