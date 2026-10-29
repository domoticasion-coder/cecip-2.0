import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Check, RefreshCw } from "lucide-react";

export interface ImagePreset {
  label: string;
  url: string;
}

interface ImageFieldEditorProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  presets?: ImagePreset[];
  helperText?: string;
  aspectRatio?: "video" | "square" | "wide";
}

const DEFAULT_PRESETS: ImagePreset[] = [
  {
    label: "Fachada CeCIP 25 de Mayo",
    url: "https://i.postimg.cc/WpC996c2/cecip-fachada-r8rfoy7572gdw9e5kbngeimw58imq1bl0s153k6uq8.jpg",
  },
  {
    label: "Reunión de Directorio / Gremial",
    url: "/images/collaboration_meeting_1782854725514.jpg",
  },
  {
    label: "Comercio y Ventas Minoristas",
    url: "/images/dia_del_padre_1782854741068.jpg",
  },
  {
    label: "Turismo y Desarrollo Paraná",
    url: "/images/turismo_parana_1782854754924.jpg",
  },
  {
    label: "Representantes y Autoridades",
    url: "/images/cecip_representatives_1782854765721.jpg",
  },
  {
    label: "Auditorio y Capacitaciones",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Innovación y Pymes",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
  }
];

export default function ImageFieldEditor({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  helperText = "Puedes ingresar una URL directa, subir una foto desde tu dispositivo o seleccionar una imagen institucional predefinida.",
  aspectRatio = "video",
}: ImageFieldEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // File upload handling via FileReader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        setImageError(false);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Hubo un error al leer la imagen del dispositivo.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    onChange(url);
    setImageError(false);
  };

  const handleClearImage = () => {
    onChange("");
    setImageError(false);
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-h-48"
      : aspectRatio === "wide"
      ? "aspect-[21/9] max-h-44"
      : "aspect-video max-h-48";

  return (
    <div className="space-y-2.5 bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} className="text-[#00a3e0]" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-sky-50 text-[#00a3e0] border border-sky-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Subir archivo desde el equipo"
          >
            <Upload size={12} />
            <span>{isUploading ? "Cargando..." : "Subir desde PC"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPresets(prev => !prev)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              showPresets
                ? "bg-[#0c2356] text-white border-[#0c2356]"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <RefreshCw size={11} className={showPresets ? "rotate-180 transition-transform" : ""} />
            <span>Galería</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={handleClearImage}
              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Quitar imagen"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* URL Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <LinkIcon size={13} />
        </div>
        <input
          type="text"
          placeholder="https://... o pega una URL de imagen"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setImageError(false);
          }}
          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#00a3e0] focus:ring-1 focus:ring-[#00a3e0] transition-all text-slate-700"
        />
      </div>

      {/* Preset Gallery Drawer */}
      {showPresets && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Imágenes Institucionales Disponibles:
            </span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`group relative rounded-lg overflow-hidden border p-1 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#00a3e0] bg-sky-50/50 ring-2 ring-[#00a3e0]/20"
                      : "border-slate-200 hover:border-[#00a3e0]/60 bg-slate-50/60"
                  }`}
                >
                  <div className="w-full h-16 rounded overflow-hidden bg-slate-100 relative">
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-[#00a3e0] text-white p-0.5 rounded-full shadow-xs">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 truncate leading-tight block">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="pt-1">
        {value ? (
          <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 shadow-inner group`}>
            {!imageError ? (
              <img
                src={value}
                alt="Vista previa"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-4 text-center">
                <ImageIcon size={24} className="text-slate-300" />
                <span className="text-[11px] font-bold text-rose-500">Error al cargar la imagen</span>
                <span className="text-[10px] text-slate-400">Verifica la URL o sube una imagen desde tu PC</span>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="truncate max-w-[200px] font-mono text-[9px] text-slate-300">
                {value.startsWith("data:") ? "Imagen cargada localmente (Base64)" : value}
              </span>
              <span className="font-bold text-emerald-400 shrink-0 flex items-center gap-1">
                <Check size={10} /> Vista previa activa
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full ${aspectClass} rounded-xl border-2 border-dashed border-slate-300 hover:border-[#00a3e0] bg-white hover:bg-sky-50/30 flex flex-col items-center justify-center gap-1.5 p-4 text-center cursor-pointer transition-all group`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-400 group-hover:text-[#00a3e0] flex items-center justify-center transition-colors">
              <Upload size={14} />
            </div>
            <p className="text-xs font-bold text-slate-600 group-hover:text-[#00a3e0] transition-colors">
              Haz clic para subir una imagen o pega un enlace arriba
            </p>
            <p className="text-[10px] text-slate-400">
              Formatos aceptados: JPG, PNG, WEBP (hasta 5MB)
            </p>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-400 leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
}
