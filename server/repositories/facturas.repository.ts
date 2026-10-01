import { supabase, db } from "../db";
import { ErpBill } from "../../src/types";

export class FacturasRepository {
  public async getAll(): Promise<ErpBill[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("facturas_cuotas")
        .select("*")
        .order("vencimiento", { ascending: false });

      if (error) {
        console.error("[FacturasRepository] Error fetching facturas from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().facturas;
  }

  public async getById(id: string): Promise<ErpBill | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("facturas_cuotas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[FacturasRepository] Error fetching factura ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().facturas.find((f) => f.id === id);
    return found || null;
  }

  public async getBySocioId(socioId: string): Promise<ErpBill[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("facturas_cuotas")
        .select("*")
        .eq("socio_id", socioId)
        .order("vencimiento", { ascending: false });

      if (error) {
        console.error(`[FacturasRepository] Error fetching facturas for socio ${socioId}:`, error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().facturas.filter((f) => f.socioId === socioId);
  }

  public async create(factura: Omit<ErpBill, "id"> & { id?: string }): Promise<ErpBill> {
    const id = factura.id || crypto.randomUUID();
    const newBill: ErpBill = {
      ...factura,
      id,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("facturas_cuotas")
        .insert({
          id: newBill.id,
          socio_id: newBill.socioId,
          socio_nombre: newBill.socioNombre,
          mes: newBill.mes,
          anio: newBill.anio,
          detalle: newBill.detalle,
          monto: newBill.monto,
          vencimiento: newBill.vencimiento,
          estado: newBill.estado || "Pendiente",
          fecha_pago: newBill.fechaPago || null,
          recibo_id: newBill.reciboId || null,
          intereses: newBill.intereses || 0,
          refinanciada: Boolean(newBill.refinanciada),
          metodo_pago: newBill.metodoPago || null,
        })
        .select()
        .single();

      if (error) {
        console.error("[FacturasRepository] Error creating factura in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.facturas.unshift(newBill);
    db.save();
    return newBill;
  }

  public async update(id: string, updates: Partial<ErpBill>): Promise<ErpBill | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.socioId !== undefined) payload.socio_id = updates.socioId;
      if (updates.socioNombre !== undefined) payload.socio_nombre = updates.socioNombre;
      if (updates.mes !== undefined) payload.mes = updates.mes;
      if (updates.anio !== undefined) payload.anio = updates.anio;
      if (updates.detalle !== undefined) payload.detalle = updates.detalle;
      if (updates.monto !== undefined) payload.monto = updates.monto;
      if (updates.vencimiento !== undefined) payload.vencimiento = updates.vencimiento;
      if (updates.estado !== undefined) payload.estado = updates.estado;
      if (updates.fechaPago !== undefined) payload.fecha_pago = updates.fechaPago;
      if (updates.reciboId !== undefined) payload.recibo_id = updates.reciboId;
      if (updates.intereses !== undefined) payload.intereses = updates.intereses;
      if (updates.refinanciada !== undefined) payload.refinanciada = updates.refinanciada;
      if (updates.metodoPago !== undefined) payload.metodo_pago = updates.metodoPago;

      const { data, error } = await supabase
        .from("facturas_cuotas")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[FacturasRepository] Error updating factura ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.facturas.findIndex((f) => f.id === id);
    if (index === -1) return null;
    state.facturas[index] = { ...state.facturas[index], ...updates };
    db.save();
    return state.facturas[index];
  }

  public async pagar(
    id: string,
    pago: {
      metodoPago?: "Mercado Pago" | "Transferencia" | "Efectivo" | "Tarjeta de Crédito" | string;
      banco?: string;
      reciboId?: string;
      fechaPago?: string;
    }
  ): Promise<{ factura: ErpBill; tesoreriaEntryId?: string }> {
    const fechaPago = pago.fechaPago || new Date().toISOString().split("T")[0];
    const reciboId = pago.reciboId || `REC-${Date.now().toString().slice(-6)}`;
    const metodoPago = (pago.metodoPago as any) || "Transferencia";

    const updatedFactura = await this.update(id, {
      estado: "Pagado",
      fechaPago,
      reciboId,
      metodoPago,
    });

    if (!updatedFactura) {
      throw new Error("Factura no encontrada.");
    }

    // Registrar en Tesorería
    const state = db.getState();
    const tesoreriaEntryId = `tes-${Date.now()}`;
    const tesEntry = {
      id: tesoreriaEntryId,
      fecha: fechaPago,
      tipo: "Ingreso" as const,
      detalle: `Cobranza Cuota ${updatedFactura.mes} ${updatedFactura.anio} - ${updatedFactura.socioNombre}`,
      concepto: `Cobranza Cuota ${updatedFactura.mes} ${updatedFactura.anio} - ${updatedFactura.socioNombre}`,
      monto: updatedFactura.monto,
      categoria: "Cuotas Sociales" as const,
      banco: (pago.banco as any) || "Banco Entre Ríos",
      comprobante: reciboId,
      conciliado: false,
    };
    if (!state.tesoreria) state.tesoreria = [];
    state.tesoreria.unshift(tesEntry);

    // Registrar en timeline del socio si existe
    const socio = (state.socios || []).find((s) => s.id === updatedFactura.socioId);
    if (socio) {
      if (!socio.timeline) socio.timeline = [];
      socio.timeline.unshift({
        id: `tl-${Date.now()}`,
        fecha: fechaPago,
        tipo: "factura",
        titulo: `Pago registrado: Cuota ${updatedFactura.mes} ${updatedFactura.anio}`,
        descripcion: `Monto: $${updatedFactura.monto.toLocaleString("es-AR")} vía ${metodoPago}. Recibo: ${reciboId}`,
        usuario: "Sistema",
      });
    }
    db.save();

    return { factura: updatedFactura, tesoreriaEntryId };
  }

  public async generarAutomaticas(
    mes: string,
    anio: number
  ): Promise<{ generadas: number; facturas: ErpBill[] }> {
    const state = db.getState();
    const sociosActivos = (state.socios || []).filter((s) => s.estado === "Activo");
    const existentes = await this.getAll();
    const nuevas: ErpBill[] = [];

    for (const socio of sociosActivos) {
      const yaExiste = existentes.some(
        (f) => f.socioId === socio.id && f.mes === mes && f.anio === anio
      );
      if (!yaExiste) {
        const montoCuota = socio.categoria === "Gran Industria" ? 18500 : socio.categoria === "Mediana Empresa" ? 12500 : 7500;
        const vencimiento = `${anio}-${mes === "Enero" ? "01" : "08"}-10`;
        const nueva = await this.create({
          socioId: socio.id,
          socioNombre: socio.razonSocial,
          mes,
          anio,
          detalle: `Cuota Social Ordinaria - ${mes} ${anio}`,
          monto: montoCuota,
          vencimiento,
          estado: "Pendiente",
          intereses: 0,
          refinanciada: false,
        });
        nuevas.push(nueva);
      }
    }

    return { generadas: nuevas.length, facturas: nuevas };
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("facturas_cuotas").delete().eq("id", id);
      if (error) {
        console.error(`[FacturasRepository] Error deleting factura ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.facturas.findIndex((f) => f.id === id);
    if (index === -1) return false;
    state.facturas.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(f: any): ErpBill {
    return {
      id: f.id,
      socioId: f.socio_id,
      socioNombre: f.socio_nombre,
      mes: f.mes,
      anio: Number(f.anio),
      detalle: f.detalle,
      monto: Number(f.monto),
      vencimiento: f.vencimiento,
      estado: f.estado,
      fechaPago: f.fecha_pago,
      reciboId: f.recibo_id,
      intereses: Number(f.intereses || 0),
      refinanciada: Boolean(f.refinanciada),
      metodoPago: f.metodo_pago,
    };
  }
}

export const facturasRepository = new FacturasRepository();
