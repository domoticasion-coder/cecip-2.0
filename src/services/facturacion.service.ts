import { apiFetch } from "./api";
import { ErpBill } from "../types";

export const facturacionService = {
  async getAll(): Promise<ErpBill[]> {
    return await apiFetch<ErpBill[]>("/api/facturas");
  },

  async getById(id: string): Promise<ErpBill> {
    return await apiFetch<ErpBill>(`/api/facturas/${id}`);
  },

  async create(factura: Partial<ErpBill>): Promise<ErpBill> {
    return await apiFetch<ErpBill>("/api/facturas", {
      method: "POST",
      body: JSON.stringify(factura),
    });
  },

  async update(id: string, factura: Partial<ErpBill>): Promise<ErpBill> {
    return await apiFetch<ErpBill>(`/api/facturas/${id}`, {
      method: "PUT",
      body: JSON.stringify(factura),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/facturas/${id}`, {
      method: "DELETE",
    });
  },

  // Transacción atómica de pago de factura: actualiza factura -> inserta movimiento tesorería -> inserta timeline
  async registrarPago(id: string, data: {
    metodoPago: "Mercado Pago" | "Transferencia" | "Efectivo" | "Tarjeta de Crédito";
    banco: "Banco Entre Ríos" | "Banco Nación" | "Caja Efectiva" | "Mercado Pago Cuenta";
    reciboId?: string;
    fechaPago?: string;
  }): Promise<{ factura: ErpBill; tesoreriaId: string; timelineId: string }> {
    return await apiFetch<{ factura: ErpBill; tesoreriaId: string; timelineId: string }>(`/api/facturas/${id}/pagar`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async generarCuotasAutomaticas(mes: string, anio: number): Promise<{ generadas: number; facturas: ErpBill[] }> {
    return await apiFetch<{ generadas: number; facturas: ErpBill[] }>("/api/facturas/generar-automaticas", {
      method: "POST",
      body: JSON.stringify({ mes, anio }),
    });
  },
};
