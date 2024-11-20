import { db } from "~/utils/db.server";

export type Restaurant = {
    id: number;
    name: string; 
    address: string;
    phone:string
  };


  export async function getRestaurants() {
    return db.restaurant.findMany({
      orderBy: { name: 'asc' }
    });
  }

  export async function createRestaurant(
    data: Pick<Restaurant, "name" | "address" | "phone">
  ) {
    return db.restaurant.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone
      }
    });
  }
  
  export async function updateRestaurant(
    id: number, 
    data: Partial<Pick<Restaurant, "name" | "address" | "phone">>
  ) {
    return db.restaurant.update({
      where: { id },
      data
    });
  }
  
  export async function deleteRestaurant(id: number) {
    // Delete associated orders first to handle cascading deletion
    await db.order.deleteMany({
      where: { restaurantId: id }
    });
  
    // Then delete the restaurant
    return db.restaurant.delete({
      where: { id }
    });
  }

  export async function getRestaurantById(id: number) {
    return db.restaurant.findUnique({
      where: { id },
      include: {
        orders: true // Opcional: incluir órdenes asociadas
      }
    });
  }