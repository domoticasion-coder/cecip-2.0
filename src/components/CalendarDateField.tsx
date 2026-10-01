import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  Sparkles,
  CalendarDays
} from "lucide-react";

interface CalendarDateFieldProps {
  label?: string;
  value: string; // Accepts "YYYY-MM-DD" or "DD/MM/YYYY"
  onChange: (data: { fecha: string; day: number; month: string; iso: string }) => void;
  required?: boolean;
}

const MONTHS_SPANISH = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS_NAMES_SPANISH = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

const WEEK_HEADER = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarDateField({
  label = "Fecha del Evento (Seleccionar en Calendario) *",
  value,
  onChange,
  required = true
}: CalendarDateFieldProps) {
  const [showCalendarGrid, setShowCalendarGrid] = useState(true);

  // Parse any incoming date into "YYYY-MM-DD"
  const isoDate = useMemo(() => {
    if (!value) return "2026-07-20";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      const parts = value.split("/");
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
    return "2026-07-20";
  }, [value]);

  // Current view state in calendar (year & month)
  const initialYear = useMemo(() => {
    const parts = isoDate.split("-");
    return parseInt(parts[0], 10) || 2026;
  }, [isoDate]);

  const initialMonth = useMemo(() => {
    const parts = isoDate.split("-");
    return (parseInt(parts[1], 10) - 1) || 6;
  }, [isoDate]);

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  // Formatted info in Spanish
  const dateInfo = useMemo(() => {
    if (!isoDate) return null;
    const [yStr, mStr, dStr] = isoDate.split("-");
    const year = parseInt(yStr, 10);
    const monthIndex = parseInt(mStr, 10) - 1;
    const day = parseInt(dStr, 10);

    const d = new Date(year, monthIndex, day);
    const dayOfWeek = DAYS_NAMES_SPANISH[d.getDay()] || "";
    const monthName = MONTHS_SPANISH[monthIndex] || "Julio";
    const formattedDDMMYYYY = `${String(day).padStart(2, "0")}/${String(monthIndex + 1).padStart(2, "0")}/${year}`;

    return {
      year,
      day,
      monthIndex,
      monthName,
      dayOfWeek,
      formattedDDMMYYYY,
      fullText: `${dayOfWeek} ${day} de ${monthName} de ${year}`
    };
  }, [isoDate]);

  // Calendar cells calculation for viewYear and viewMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // In JS: 0=Dom, 1=Lun ... convert to Monday=0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6; // Sunday becomes index 6

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      year: number;
      month: number;
      isoString: string;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    // Today's date string
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Leading days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const iso = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      cells.push({
        dayNumber: dNum,
        isCurrentMonth: false,
        year: prevY,
        month: prevM,
        isoString: iso,
        isSelected: iso === isoDate,
        isToday: iso === todayIso
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        year: viewYear,
        month: viewMonth,
        isoString: iso,
        isSelected: iso === isoDate,
        isToday: iso === todayIso
      });
    }

    // Trailing days to fill 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let r = 1; r <= remaining; r++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const iso = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(r).padStart(2, "0")}`;
      cells.push({
        dayNumber: r,
        isCurrentMonth: false,
        year: nextY,
        month: nextM,
        isoString: iso,
        isSelected: iso === isoDate,
        isToday: iso === todayIso
      });
    }

    return cells;
  }, [viewYear, viewMonth, isoDate]);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Day selection in calendar
  const handleSelectDay = (cell: { dayNumber: number; month: number; year: number; isoString: string }) => {
    const monthName = MONTHS_SPANISH[cell.month] || "Julio";
    const fecha = `${String(cell.dayNumber).padStart(2, "0")}/${String(cell.month + 1).padStart(2, "0")}/${cell.year}`;
    
    onChange({
      fecha,
      day: cell.dayNumber,
      month: monthName,
      iso: cell.isoString
    });
  };

  // Native input change
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;
    const [y, m, d] = val.split("-").map(Number);
    const monthName = MONTHS_SPANISH[m - 1] || "Julio";
    const fecha = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;

    setViewYear(y);
    setViewMonth(m - 1);

    onChange({
      fecha,
      day: d,
      month: monthName,
      iso: val
    });
  };

  // Preset shortcuts
  const handleShortcut = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const y = target.getFullYear();
    const m = target.getMonth() + 1;
    const d = target.getDate();
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const monthName = MONTHS_SPANISH[m - 1] || "Julio";
    const fecha = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;

    setViewYear(y);
    setViewMonth(m - 1);

    onChange({
      fecha,
      day: d,
      month: monthName,
      iso
    });
  };

  return (
    <div className="space-y-3 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-4 rounded-2xl border border-indigo-100 shadow-sm text-left">
      {/* Header with Title and Selected Date Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon size={15} className="text-indigo-600" />
          <span>{label}</span>
        </label>

        {dateInfo && (
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/90 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Check size={11} className="text-indigo-600" />
            <span>{dateInfo.formattedDDMMYYYY}</span>
          </span>
        )}
      </div>

      {/* Selected Date Summary Display Card */}
      <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col items-center justify-center shadow-xs shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest leading-none text-indigo-200">
              {dateInfo ? dateInfo.monthName.slice(0, 3) : "JUL"}
            </span>
            <span className="text-lg font-black leading-none pt-0.5">
              {dateInfo ? dateInfo.day : "20"}
            </span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              {dateInfo ? dateInfo.fullText : "Selecciona una fecha en el calendario"}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Día: <strong className="text-indigo-700">{dateInfo?.day}</strong></span>
              <span>•</span>
              <span>Mes: <strong className="text-indigo-700">{dateInfo?.monthName}</strong></span>
              <span>•</span>
              <span>Año: <strong className="text-indigo-700">{dateInfo?.year}</strong></span>
            </p>
          </div>
        </div>

        {/* Native date input picker fallback / quick picker */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input 
              type="date"
              required={required}
              value={isoDate}
              onChange={handleNativeChange}
              className="w-full sm:w-auto bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
              title="Selector de fecha alternativo del navegador"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCalendarGrid(prev => !prev)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200/80 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
          >
            <CalendarDays size={13} />
            <span>{showCalendarGrid ? "Ocultar Cuadrícula" : "Ver Calendario"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Calendar Grid */}
      {showCalendarGrid && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-inner space-y-2.5">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
              <span className="capitalize">{MONTHS_SPANISH[viewMonth]}</span>
              <span className="text-indigo-600">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEK_HEADER.map((w, idx) => (
              <span 
                key={idx} 
                className={`text-[10px] font-bold py-1 ${idx >= 5 ? "text-rose-500" : "text-slate-400"}`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.isSelected;
              const isToday = cell.isToday;
              const isCurr = cell.isCurrentMonth;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell)}
                  className={`
                    relative h-8 sm:h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer
                    ${!isCurr ? "text-slate-300 hover:bg-slate-50" : "text-slate-700 hover:bg-indigo-50"}
                    ${isSelected 
                      ? "bg-indigo-600 !text-white font-bold shadow-xs scale-[1.03] z-10 hover:!bg-indigo-700" 
                      : ""
                    }
                    ${isToday && !isSelected ? "border border-indigo-400 font-bold text-indigo-700 bg-indigo-50/50" : ""}
                  `}
                  title={`${cell.dayNumber} de ${MONTHS_SPANISH[cell.month]} de ${cell.year}`}
                >
                  <span>{cell.dayNumber}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-600" />
                  )}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick preset shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-slate-400 font-semibold mr-1">Atajos Rápidos:</span>
        <button
          type="button"
          onClick={() => handleShortcut(0)}
          className="px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => handleShortcut(1)}
          className="px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          Mañana
        </button>
        <button
          type="button"
          onClick={() => handleShortcut(7)}
          className="px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          En 7 Días
        </button>
        <button
          type="button"
          onClick={() => handleShortcut(15)}
          className="px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          En 15 Días
        </button>
        <button
          type="button"
          onClick={() => handleShortcut(30)}
          className="px-2.5 py-1 text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          En 1 Mes
        </button>
      </div>
    </div>
  );
}
