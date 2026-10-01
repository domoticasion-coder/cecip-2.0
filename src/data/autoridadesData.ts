export interface AuthorityMember {
  name: string;
  role: string;
  company: string;
  level: "presidencia" | "mesa" | "vocales" | "revisores";
}

export const CECIP_AUTORIDADES: AuthorityMember[] = [
  // Presidencia (Top row - Centered)
  { 
    name: "Mauricio Benitende", 
    role: "PRESIDENTE", 
    company: "Perseo SRL", 
    level: "presidencia" 
  },
  { 
    name: "Victor E. Bejar", 
    role: "VICEPRESIDENTE", 
    company: "Tienda El Mago", 
    level: "presidencia" 
  },

  // Mesa Ejecutiva (Second row - 4 columns)
  { 
    name: "Gabriel N. Icasatti", 
    role: "SECRETARIO", 
    company: "BlackBaley", 
    level: "mesa" 
  },
  { 
    name: "Marcelo Quiroga", 
    role: "PROSECRETARIO", 
    company: "EGE S.A.", 
    level: "mesa" 
  },
  { 
    name: "Edgardo R. Greca", 
    role: "TESORERO", 
    company: "Greca S.A.", 
    level: "mesa" 
  },
  { 
    name: "Ricardo Fernández", 
    role: "PROTESORERO", 
    company: "CMS S.A.", 
    level: "mesa" 
  },

  // Vocales (Third row - 6 columns)
  { 
    name: "Esteban A. Danessi", 
    role: "Vocal Titular 1°", 
    company: "Eco Diseño Paraná", 
    level: "vocales" 
  },
  { 
    name: "Raúl Habid", 
    role: "Vocal Titular 2°", 
    company: "Trapoteca SAS", 
    level: "vocales" 
  },
  { 
    name: "Mirko Pacoricona", 
    role: "Vocal Suplente 1°", 
    company: "Yasu S.R.L.", 
    level: "vocales" 
  },
  { 
    name: "Pedro Guzmán Berón", 
    role: "Vocal Suplente 2°", 
    company: "Win S.R.L", 
    level: "vocales" 
  },
  { 
    name: "Silvia Bechir", 
    role: "Vocal Suplente 3°", 
    company: "HB Productos de Seguridad", 
    level: "vocales" 
  },
  { 
    name: "Danilo Brizuela", 
    role: "Vocal Suplente 4°", 
    company: "Uomo Libre", 
    level: "vocales" 
  },

  // Revisores de Cuentas (Fourth row - 2 columns Centered)
  { 
    name: "David Bresler", 
    role: "Revisor de Cuentas 1°", 
    company: "Sentir lo Nuestro", 
    level: "revisores" 
  },
  { 
    name: "Esteban A. Enrique", 
    role: "Revisor de Cuentas 2°", 
    company: "Diseñarte Creaciones", 
    level: "revisores" 
  }
];
