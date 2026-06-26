export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    activo: "bg-green-100 text-green-800",
    inactivo: "bg-gray-100 text-gray-800",
    registrado: "bg-blue-100 text-blue-800",
    confirmado: "bg-green-100 text-green-800",
    descalificado: "bg-red-100 text-red-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    en_curso: "bg-blue-100 text-blue-800",
    finalizado: "bg-green-100 text-green-800",
    cancelada: "bg-red-100 text-red-800",
    disponible: "bg-green-100 text-green-800",
    ocupada: "bg-red-100 text-red-800",
    mantenimiento: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    activo: "Activo",
    inactivo: "Inactivo",
    registrado: "Registrado",
    confirmado: "Confirmado",
    descalificado: "Descalificado",
    pendiente: "Pendiente",
    en_curso: "En Curso",
    finalizado: "Finalizado",
    cancelada: "Cancelada",
    disponible: "Disponible",
    ocupada: "Ocupada",
    mantenimiento: "Mantenimiento",
  };
  return labels[status] || status;
};
