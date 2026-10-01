import { apiFetch } from "../api";

export interface CopilotQueryRequest {
  tool: "get_deudores" | "get_socio_info" | "get_financial_summary" | "get_eventos_proximos" | "search_cvs";
  params?: Record<string, any>;
}

export const copilotToolsService = {
  async executeTool(tool: string, params?: Record<string, any>): Promise<any> {
    return await apiFetch("/api/copilot/tools", {
      method: "POST",
      body: JSON.stringify({ tool, params }),
    });
  },

  async askCopilot(prompt: string, context?: any): Promise<{ text: string }> {
    return await apiFetch<{ text: string }>("/api/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ prompt, context }),
    });
  },
};
