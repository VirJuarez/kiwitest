export function validateRestaurant(data: {
    name: string, 
    address: string, 
    phone: string
  }) {
    const errors: Record<string, string> = {};
  
    if (!data.name || data.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }
  
    if (!data.address || data.address.trim().length < 5) {
      errors.address = "La dirección debe tener al menos 5 caracteres";
    }
  
    if (!data.phone || !/^\d{9,12}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.phone = "El teléfono debe tener entre 9 y 12 dígitos";
    }
  
    return errors;
  }