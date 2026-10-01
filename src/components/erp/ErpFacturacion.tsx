import React, { useState } from "react";
import { ErpBill, ErpTesoreriaEntry, ErpSocio } from "../../types";
import { 
  Coins, Plus, Mail, CheckCircle2, AlertTriangle, FileText, Download, 
  Trash2, Filter, Search, ShieldCheck, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Layers
} from "lucide-react";

interface ErpFacturacionProps {
  bills: ErpBill[];
  tesoreria: ErpTesoreriaEntry[];
  socios: ErpSocio[];
  onSaveBills: (updated: ErpBill[]) => void;
  onSaveTesoreria: (updated: ErpTesoreriaEntry[]) => void;
  onSaveSocios: (updated: ErpSocio[]) => void;
  role: string;
}

export default function ErpFacturacion({ 
  bills, tesoreria, socios, onSaveBills, onSaveTesoreria, onSaveSocios, role 
}: ErpFacturacionProps) {
  const [activeTab, setActiveTab] = useState<"facturas" | "tesoreria" | "reportes">("facturas");
  
  // Filters
  const [billSearch, setBillSearch] = useState("");
  const [billFilterEstado, setBillFilterEstado] = useState<string>("todos");
  
  // Add new bill form
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [formBill, setFormBill] = useState({
    socioId: "",
    mes: "Julio",
    monto: 3500,
    detalle: "Cuota Social Julio 2026"
  });

  // Add new treasury entry form
  const [showAddTesoreriaModal, setShowAddTesoreriaModal] = useState(false);
  const [formTesoreria, setFormTesoreria] = useState({
    tipo: "Ingreso" as "Ingreso" | "Egreso",
    detalle: "",
    monto: 1000,
    categoria: "Cuotas Sociales" as any,
    banco: "Banco Entre Ríos" as any
  });

  const canEdit = ["Administrador General", "Gerencia", "Tesorería", "Administración"].includes(role);

  // Financial status calculations
  const totalCaja = tesoreria
    .filter(t => t.banco === "Caja Efectiva")
    .reduce((sum, t) => sum + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);

  const totalBancoEntreRios = tesoreria
    .filter(t => t.banco === "Banco Entre Ríos")
    .reduce((sum, t) => sum + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);

  const totalMercadoPago = tesoreria
    .filter(t => t.banco === "Mercado Pago Cuenta")
    .reduce((sum, t) => sum + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);

  const totalBancoNacion = tesoreria
    .filter(t => t.banco === "Banco Nación")
    .reduce((sum, t) => sum + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);

  const totalCashAndBanks = totalCaja + totalBancoEntreRios + totalMercadoPago + totalBancoNacion;

  // Automated Cuotas social generation for all active partners
  const handleGenerateAutomaticBills = () => {
    if (!canEdit) return;
    if (!window.confirm("¿Desea generar automáticamente la cuota social de Julio 2026 para todos los socios activos?")) return;

    const activePartners = socios.filter(s => s.estado === "Activo");
    const newBills: ErpBill[] = [];

    activePartners.forEach(p => {
      // Determine fee amount by category
      let amount = 3500;
      if (p.categoria === "Mediana Empresa") amount = 6000;
      if (p.categoria === "Gran Industria") amount = 12000;
      if (p.categoria === "Servicios") amount = 4500;

      // Check if already billed
      const alreadyBilled = bills.some(b => b.socioId === p.id && b.mes === "Julio" && b.anio === 2026);
      if (!alreadyBilled) {
        newBills.push({
          id: `fac-auto-${Date.now()}-${p.id}`,
          socioId: p.id,
          socioNombre: p.nombreComercial,
          mes: "Julio",
          anio: 2026,
          detalle: `Cuota Social Julio 2026`,
          monto: amount,
          vencimiento: "2026-07-15",
          estado: "Pendiente"
        });
      }
    });

    if (newBills.length === 0) {
      alert("Todos los socios activos ya tienen su cuota de Julio facturada.");
      return;
    }

    onSaveBills([...newBills, ...bills]);
    alert(`Se han emitido con éxito ${newBills.length} nuevas facturas.`);
  };

  // Mark a bill as paid manually
  const handleMarkAsPaid = (bill: ErpBill, method: any) => {
    if (!canEdit) return;

    // Update bill
    const updatedBills = bills.map(b => {
      if (b.id === bill.id) {
        return {
          ...b,
          estado: "Pagado" as const,
          fechaPago: new Date().toISOString().split("T")[0],
          reciboId: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
          metodoPago: method
        };
      }
      return b;
    });

    onSaveBills(updatedBills);

    // Create financial ledger entry
    const newLedger: ErpTesoreriaEntry = {
      id: `t-entry-pay-${Date.now()}`,
      tipo: "Ingreso",
      detalle: `Cobro cuota: ${bill.socioNombre} (${bill.mes} ${bill.anio})`,
      monto: bill.monto + (bill.intereses || 0),
      fecha: new Date().toISOString().split("T")[0],
      categoria: "Cuotas Sociales",
      banco: method === "Mercado Pago" ? "Mercado Pago Cuenta" : "Banco Entre Ríos",
      conciliado: true
    };

    onSaveTesoreria([newLedger, ...tesoreria]);
    
    // Add to Socio Timeline
    const updatedSocios = socios.map(s => {
      if (s.id === bill.socioId) {
        return {
          ...s,
          timeline: [
            ...s.timeline,
            {
              id: `t-pay-${Date.now()}`,
              titulo: "Pago Recibido",
              descripcion: `Canceló ${bill.detalle} por $${bill.monto}. Recibo ${newLedger.detalle}`,
              fecha: new Date().toISOString().split("T")[0],
              tipo: "factura" as const
            }
          ]
        };
      }
      return s;
    });
    onSaveSocios(updatedSocios);

    alert("El pago ha sido acreditado en tesorería y se generó el recibo.");
  };

  // Add individual bill
  const handleAddBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const selectedPartner = socios.find(s => s.id === formBill.socioId);
    if (!selectedPartner) return;

    const newBill: ErpBill = {
      id: `fac-ind-${Date.now()}`,
      socioId: formBill.socioId,
      socioNombre: selectedPartner.nombreComercial,
      mes: formBill.mes,
      anio: 2026,
      detalle: formBill.detalle,
      monto: formBill.monto,
      vencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      estado: "Pendiente"
    };

    onSaveBills([newBill, ...bills]);
    setShowAddBillModal(false);
  };

  // Add treasury manual entry
  const handleAddTesoreriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const newEntry: ErpTesoreriaEntry = {
      id: `t-man-${Date.now()}`,
      tipo: formTesoreria.tipo,
      detalle: formTesoreria.detalle,
      monto: formTesoreria.monto,
      fecha: new Date().toISOString().split("T")[0],
      categoria: formTesoreria.categoria,
      banco: formTesoreria.banco,
      conciliado: false
    };

    onSaveTesoreria([newEntry, ...tesoreria]);
    setShowAddTesoreriaModal(false);
  };

  // Reconcile bank row
  const toggleReconciliation = (id: string) => {
    if (!canEdit) return;
    const updated = tesoreria.map(t => {
      if (t.id === id) return { ...t, conciliado: !t.conciliado };
      return t;
    });
    onSaveTesoreria(updated);
  };

  // Notification simulation
  const simulateEmailNotification = (bill: ErpBill) => {
    alert(`Enviando notificación automática...\n\nSocio: ${bill.socioNombre}\nDetalle: ${bill.detalle}\nMonto: $${bill.monto}\nVencimiento: ${bill.vencimiento}\n\nSe envió un correo electrónico institucional de recordatorio junto con el link de pago seguro de Mercado Pago.`);
  };

  // Report downloader simulation
  const handleDownloadReport = (format: "pdf" | "excel" | "csv", reportType: string) => {
    const filename = `Reporte_${reportType.replace(" ", "_")}_CeCIP.${format}`;
    alert(`Generando ${format.toUpperCase()}...\n\nSe ha preparado el informe con los datos consolidados del sistema CeCIP.\nNombre del archivo: ${filename}\n\n¡La simulación de descarga se completó con éxito!`);
  };

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.socioNombre.toLowerCase().includes(billSearch.toLowerCase()) || b.detalle.toLowerCase().includes(billSearch.toLowerCase());
    const matchesEstado = billFilterEstado === "todos" || b.estado === billFilterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub tabs header */}
      <div className="border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("facturas")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "facturas" ? "bg-cecip-blue text-white shadow" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            Facturación y Cuotas
          </button>
          <button 
            onClick={() => setActiveTab("tesoreria")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "tesoreria" ? "bg-cecip-blue text-white shadow" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            Tesorería y Caja
          </button>
          <button 
            onClick={() => setActiveTab("reportes")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "reportes" ? "bg-cecip-blue text-white shadow" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            Centro de Reportes
          </button>
        </div>

        {activeTab === "facturas" && canEdit && (
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateAutomaticBills}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Generar Lote Cuotas</span>
            </button>
            <button 
              onClick={() => setShowAddBillModal(true)}
              className="px-3.5 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Emitir Factura</span>
            </button>
          </div>
        )}

        {activeTab === "tesoreria" && canEdit && (
          <button 
            onClick={() => setShowAddTesoreriaModal(true)}
            className="px-3.5 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Nueva Operación Caja</span>
          </button>
        )}
      </div>

      {/* VIEW 1: BILLS AND INVOICES */}
      {activeTab === "facturas" && (
        <div className="space-y-6">
          {/* Quick Filter Section */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por asociado o detalle..."
                value={billSearch}
                onChange={(e) => setBillSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex gap-2 self-stretch sm:self-auto">
              <button 
                onClick={() => setBillFilterEstado("todos")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${billFilterEstado === "todos" ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setBillFilterEstado("Pagado")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${billFilterEstado === "Pagado" ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                Cobradas
              </button>
              <button 
                onClick={() => setBillFilterEstado("Pendiente")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${billFilterEstado === "Pendiente" ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                Pendientes
              </button>
              <button 
                onClick={() => setBillFilterEstado("Mora")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${billFilterEstado === "Mora" ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                En Mora
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-700/50">
                <thead className="bg-slate-50 dark:bg-slate-700/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Socio Asociado</th>
                    <th className="p-4">Detalle / Cuota</th>
                    <th className="p-4">Monto Original</th>
                    <th className="p-4">Intereses / Mora</th>
                    <th className="p-4">Vencimiento</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Gestiones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-600 dark:text-slate-300">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No hay registros de facturas emitidas que coincidan.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          {bill.socioNombre}
                        </td>
                        <td className="p-4 font-medium">
                          {bill.detalle} ({bill.mes} {bill.anio})
                        </td>
                        <td className="p-4 font-mono font-semibold">${bill.monto}</td>
                        <td className="p-4 font-mono">
                          {bill.intereses ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">+${bill.intereses}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 font-mono">{bill.vencimiento}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            bill.estado === "Pagado" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" :
                            bill.estado === "Mora" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}>
                            {bill.estado === "Pagado" ? "COBRADO" : bill.estado === "Mora" ? "EN MORA" : "PENDIENTE"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {bill.estado !== "Pagado" && canEdit && (
                              <button 
                                onClick={() => handleMarkAsPaid(bill, "Mercado Pago")}
                                className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-extrabold rounded text-[10px] transition-all cursor-pointer"
                                title="Acreditar Cobro manual"
                              >
                                Cobrar
                              </button>
                            )}
                            <button 
                              onClick={() => simulateEmailNotification(bill)}
                              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-400 hover:text-cecip-blue hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                              title="Enviar recordatorio automático"
                            >
                              <Mail size={13} />
                            </button>
                            <button 
                              onClick={() => {
                                if (bill.estado === "Pagado") {
                                  alert(`--- COMPROBANTE DE COBRO GENERAL ---\nCeCIP Paraná\nComprobante: ${bill.reciboId}\nSocio: ${bill.socioNombre}\nDetalle: ${bill.detalle}\nMonto total: $${bill.monto + (bill.intereses || 0)}\nFecha: ${bill.fechaPago}\nForma de cobro: ${bill.metodoPago}\n----------------------------------\n\nEl recibo está firmado digitalmente y listo para su descarga.`);
                                } else {
                                  alert(`--- DETALLE DE DEUDA ---\nCeCIP Paraná\nSocio: ${bill.socioNombre}\nDetalle: ${bill.detalle}\nMonto original: $${bill.monto}\nIntereses moratorios: $${bill.intereses || 0}\nMonto final a abonar: $${bill.monto + (bill.intereses || 0)}\nVencimiento original: ${bill.vencimiento}\n-------------------------`);
                                }
                              }}
                              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                              title="Ver Comprobante PDF"
                            >
                              <FileText size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CASH LEDGER & BANK ACCOUNTS */}
      {activeTab === "tesoreria" && (
        <div className="space-y-6">
          {/* Bank balance metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Caja Chica (Efectiva)</p>
              <h4 className={`text-xl font-extrabold font-mono ${totalCaja >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600"}`}>
                ${totalCaja.toLocaleString()}
              </h4>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Banco Entre Ríos CC</p>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                ${totalBancoEntreRios.toLocaleString()}
              </h4>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mercado Pago Cuenta</p>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                ${totalMercadoPago.toLocaleString()}
              </h4>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1 bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-800 dark:to-slate-800/80">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fondos Totales CeCIP</p>
              <h4 className="text-xl font-extrabold text-cecip-blue dark:text-blue-300 font-mono">
                ${totalCashAndBanks.toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Cash Ledger Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Caja Diaria y Movimientos Financieros</h3>
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Caja conciliada al 100%</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-700/50">
                <thead className="bg-slate-50 dark:bg-slate-700/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Detalle / Concepto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Medio de Pago</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4 text-center">Conciliado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-600 dark:text-slate-300">
                  {tesoreria.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="p-4 font-mono">{t.fecha}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{t.detalle}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[9px]">
                          {t.categoria}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{t.banco}</td>
                      <td className="p-4 font-mono font-bold">
                        {t.tipo === "Ingreso" ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                            <ArrowUpRight size={12} />
                            +${t.monto.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                            <ArrowDownRight size={12} />
                            -${t.monto.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleReconciliation(t.id)}
                          className={`p-1 rounded text-xs cursor-pointer ${t.conciliado ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"}`}
                          title="Cambiar estado de conciliación bancaria"
                        >
                          {t.conciliado ? "✅ Conciliado" : "⏳ Pendiente"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => alert(`Detalles del Movimiento:\nID: ${t.id}\nDetalle: ${t.detalle}\nMonto: $${t.monto}\nFecha: ${t.fecha}\nCategoría: ${t.categoria}\nBanco: ${t.banco}\nEstado: ${t.conciliado ? "Conciliado" : "Pendiente"}`)}
                          className="text-[10px] text-cecip-blue hover:underline cursor-pointer font-bold"
                        >
                          Ver comprobante
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: REPORT EXPORTER CENTER */}
      {activeTab === "reportes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="p-3 bg-blue-50 dark:bg-blue-950/30 text-cecip-blue dark:text-blue-300 rounded-2xl inline-block">
                <Coins size={22} />
              </span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 pt-2">Informe de Morosidad</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Padrón consolidado de asociados con cuotas vencidas, riesgo de morosidad proyectado, e intereses devengados acumulados.
              </p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
              <button 
                onClick={() => handleDownloadReport("pdf", "Morosidad")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Download size={11} /> PDF
              </button>
              <button 
                onClick={() => handleDownloadReport("excel", "Morosidad")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Download size={11} /> Excel
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300 rounded-2xl inline-block">
                <DollarSign size={22} />
              </span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 pt-2">Balance de Tesoreria</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Libro diario de caja, conciliación de cuentas bancarias y flujo de fondos acumulado mensual y semestral.
              </p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
              <button 
                onClick={() => handleDownloadReport("pdf", "Tesoreria")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Download size={11} /> PDF
              </button>
              <button 
                onClick={() => handleDownloadReport("excel", "Tesoreria")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Download size={11} /> Excel
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-300 rounded-2xl inline-block">
                <Layers size={22} />
              </span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 pt-2">Estadísticas de Eventos</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Padrón de inscriptos, presentismo y acreditación a capacitaciones organizadas con control de cupos institucionales.
              </p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
              <button 
                onClick={() => handleDownloadReport("pdf", "Eventos")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Download size={11} /> PDF
              </button>
              <button 
                onClick={() => handleDownloadReport("csv", "Eventos")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Download size={11} /> CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILL MODAL */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="bg-cecip-blue text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Emitir Factura Individual</h4>
              <button onClick={() => setShowAddBillModal(false)} className="text-white hover:text-white/80 cursor-pointer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddBillSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Seleccionar Asociado</label>
                <select 
                  required
                  value={formBill.socioId}
                  onChange={(e) => setFormBill({ ...formBill, socioId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  <option value="">-- Seleccionar Socio --</option>
                  {socios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombreComercial}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Detalle de Cobro</label>
                <input 
                  type="text"
                  required
                  value={formBill.detalle}
                  onChange={(e) => setFormBill({ ...formBill, detalle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Monto ($)</label>
                  <input 
                    type="number"
                    required
                    value={formBill.monto}
                    onChange={(e) => setFormBill({ ...formBill, monto: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Mes</label>
                  <select 
                    value={formBill.mes}
                    onChange={(e) => setFormBill({ ...formBill, mes: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="Mayo">Mayo</option>
                    <option value="Junio">Junio</option>
                    <option value="Julio">Julio</option>
                    <option value="Agosto">Agosto</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Emitir Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TREASURY MODAL */}
      {showAddTesoreriaModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="bg-cecip-blue text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Registrar Operación de Caja</h4>
              <button onClick={() => setShowAddTesoreriaModal(false)} className="text-white hover:text-white/80 cursor-pointer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddTesoreriaSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Tipo de Movimiento</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormTesoreria({ ...formTesoreria, tipo: "Ingreso" })}
                    className={`flex-1 py-2 font-bold rounded-xl border text-center transition-all cursor-pointer ${formTesoreria.tipo === "Ingreso" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                  >
                    📈 INGRESO
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormTesoreria({ ...formTesoreria, tipo: "Egreso" })}
                    className={`flex-1 py-2 font-bold rounded-xl border text-center transition-all cursor-pointer ${formTesoreria.tipo === "Egreso" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                  >
                    📉 EGRESO
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Detalle / Concepto</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Pago de luz local CeCIP / Compra de insumos"
                  value={formTesoreria.detalle}
                  onChange={(e) => setFormTesoreria({ ...formTesoreria, detalle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Monto ($)</label>
                  <input 
                    type="number"
                    required
                    value={formTesoreria.monto}
                    onChange={(e) => setFormTesoreria({ ...formTesoreria, monto: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Categoría</label>
                  <select 
                    value={formTesoreria.categoria}
                    onChange={(e) => setFormTesoreria({ ...formTesoreria, categoria: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="Cuotas Sociales">Cuotas Sociales</option>
                    <option value="Sueldos">Sueldos</option>
                    <option value="Servicios Públicos">Servicios Públicos</option>
                    <option value="Capacitaciones">Capacitaciones</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Cuenta Financiera / Banco</label>
                <select 
                  value={formTesoreria.banco}
                  onChange={(e) => setFormTesoreria({ ...formTesoreria, banco: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  <option value="Banco Entre Ríos">Banco Entre Ríos CC</option>
                  <option value="Banco Nación">Banco Nación</option>
                  <option value="Caja Efectiva">Caja Efectiva (Efectivo)</option>
                  <option value="Mercado Pago Cuenta">Mercado Pago Cuenta</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddTesoreriaModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
