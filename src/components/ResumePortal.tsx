import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { CVSubmission } from "../types";
import { postularCv } from "../lib/erp";

interface ResumePortalProps {
  onCVSubmitted?: (cv: CVSubmission) => void;
}

export default function ResumePortal({ onCVSubmitted }: ResumePortalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    areaBusqueda: "Administración",
    tipoProfesional: "Estudiante / Junior",
    comentarios: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const areas = [
    "Administración",
    "Ventas y Comercial",
    "Industria y Producción",
    "Tecnología y Sistemas",
    "Soporte Técnico",
    "Logística y Depósito",
    "Atención al Cliente",
    "Oficios / Operativo",
    "Otros"
  ];

  const tipos = [
    "Estudiante / Junior",
    "Técnico Especialista",
    "Profesional Senior",
    "Oficios / Operario calificado",
    "Prácticas Profesionales"
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedExtensions = ["pdf", "doc", "docx"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError("Solo se admiten archivos PDF o Word (.doc, .docx).");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
      setError("El archivo supera el límite de 5MB.");
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre || !formData.email || !formData.telefono) {
      setError("Por favor completa los campos de contacto obligatorios.");
      return;
    }

    if (!file) {
      setError("Debe adjuntar su currículum vitae (PDF o Word) para poder postularse.");
      return;
    }

    setIsSubmitting(true);

    try {
      // El CV queda en el ERP del CeCIP (Bolsa de empleo), con el archivo en un almacenamiento privado
      await postularCv({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        area: formData.areaBusqueda,
        tipoProfesional: formData.tipoProfesional,
        comentarios: formData.comentarios,
      }, file);

      const newCV: CVSubmission = {
        id: "cv-" + Date.now(),
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        areaBusqueda: formData.areaBusqueda,
        tipoProfesional: formData.tipoProfesional,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        fechaSubida: new Date().toISOString().split("T")[0],
        comentarios: formData.comentarios,
        interesados: [],
      };

      setIsSubmitting(false);
      setSubmitSuccess(true);
      if (onCVSubmitted) {
        onCVSubmitted(newCV);
      }

      // Reset Form
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        areaBusqueda: "Administración",
        tipoProfesional: "Estudiante / Junior",
        comentarios: "",
      });
      setFile(null);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "Error al enviar la postulación.");
    }
  };

  return (
    <div id="cv-upload-card" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative colored glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-cecip-blue/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-cecip-blue/5 text-cecip-blue text-xs font-bold uppercase tracking-wider">
            Bolsa de Empleo CeCIP
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Envíanos tu Currículum Vitae
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Forma parte de la base de talentos oficial de Paraná. Tu perfil estará disponible para que las más de 200 empresas socias del CeCIP puedan consultarlo para búsquedas activas.
          </p>
        </div>

        {submitSuccess ? (
          <div 
            className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-4 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">¡Currículum recibido correctamente!</h4>
              <p className="text-slate-600 text-xs max-w-md mx-auto">
                Tu CV ha sido registrado exitosamente en la Bolsa de Empleo del CeCIP Paraná. Las empresas asociadas comenzarán a evaluar tu perfil según sus áreas de búsqueda de personal.
              </p>
            </div>
            <button 
              onClick={() => setSubmitSuccess(false)}
              className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-sm"
            >
              Cargar otro currículum
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo *</label>
                <input 
                  type="text" 
                  name="nombre" 
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico *</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono de Contacto *</label>
                <input 
                  type="tel" 
                  name="telefono" 
                  required
                  placeholder="Ej. 343 154123456"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Área de Búsqueda *</label>
                <select 
                  name="areaBusqueda"
                  value={formData.areaBusqueda}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
                >
                  {areas.map((area, i) => (
                    <option key={i} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo / Perfil Profesional *</label>
                <select 
                  name="tipoProfesional"
                  value={formData.tipoProfesional}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
                >
                  {tipos.map((tipo, i) => (
                    <option key={i} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breve Presentación / Comentarios</label>
              <textarea 
                name="comentarios" 
                rows={3}
                placeholder="Cuéntanos brevemente sobre tu experiencia, disponibilidad horaria o aspiraciones laborales..."
                value={formData.comentarios}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Drag & Drop File Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Adjuntar Currículum * (PDF, Word hasta 5MB)</label>
              
              {!file ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? "border-cecip-blue bg-cecip-blue/5 scale-[0.99]" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-full group-hover:bg-slate-100 transition-colors">
                    <Upload size={22} className="text-cecip-blue" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">Arrastra tu archivo aquí o haz clic para buscar</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Soporta PDF o Word (Docx) de hasta 5 megabytes</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-cecip-blue/10 text-cecip-blue rounded-xl">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-tight">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-cecip-blue hover:bg-cecip-blue/90 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm tracking-wide rounded-xl shadow-lg shadow-cecip-blue/10 hover:shadow-xl hover:shadow-cecip-blue/15 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Procesando Currículum...</span>
                  </>
                ) : (
                  <span>Registrar mi Currículum</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
