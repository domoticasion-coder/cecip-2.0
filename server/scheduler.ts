import { intelligenceEngine } from "./intelligence/engine";

export class OperationalScheduler {
  private intervalTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastExecution: string | null = null;
  private lastResult: any = null;
  private intervalMinutes = 30;

  public start(intervalMinutes = 30) {
    this.intervalMinutes = intervalMinutes;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    console.log(`[Scheduler] Iniciado motor de tareas periódicas CeCIP (cada ${intervalMinutes} minutos).`);

    // Ejecución inicial después de 5 segundos de inicio del servidor
    setTimeout(() => {
      this.executeRoutine();
    }, 5000);

    this.intervalTimer = setInterval(() => {
      this.executeRoutine();
    }, intervalMinutes * 60 * 1000);
  }

  public async executeRoutine(): Promise<{
    nuevasAlertas: number;
    nuevasAcciones: number;
    nuevasOportunidades: number;
    automatizacionesEjecutadas: number;
  } | null> {
    if (this.isRunning) {
      console.log("[Scheduler] Rutina ya en ejecución, omitiendo ciclo concurrente.");
      return null;
    }
    this.isRunning = true;

    try {
      console.log("[Scheduler] Ejecutando análisis periódico de salud, morosidad, alertas y automatizaciones...");
      const resultado = await intelligenceEngine.runFullAnalysis("Scheduler Automático CeCIP");
      this.lastExecution = new Date().toISOString();
      this.lastResult = resultado;
      console.log(`[Scheduler] Rutina completada exitosamente: ${resultado.nuevasAlertas} alertas nuevas, ${resultado.nuevasAcciones} acciones nuevas, ${resultado.automatizacionesEjecutadas} automatizaciones.`);
      return resultado;
    } catch (err) {
      console.error("[Scheduler] Error ejecutando rutina periódica:", err);
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  public getStatus() {
    return {
      active: this.intervalTimer !== null,
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      lastExecution: this.lastExecution,
      lastResult: this.lastResult,
    };
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
      console.log("[Scheduler] Tareas periódicas detenidas.");
    }
  }
}

export const operationalScheduler = new OperationalScheduler();
