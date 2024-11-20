import { db } from "~/utils/db.server";

export type Client = {
    id: number;
    name: string;
    surname: string;
    address: string;
    phone: string
};

export async function getClients() {
    return db.client.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createClient(
    data: Pick<Client, "name" | "surname" | "address" | "phone">
) {
    return db.client.create({
        data: {
            name: data.name,
            surname: data.surname,
            address: data.address,
            phone: data.phone
        }
    });
}

export async function updateClient(
    id: number, 
    data: Partial<Pick<Client, "name" | "surname" | "address" | "phone">>
) {
    return db.client.update({
        where: { id },
        data
    });
}

export async function deleteClient(id: number) {
    await db.order.deleteMany({
        where: { clientId: id }
      });

    return db.client.delete({
        where: { id }
    });
}

export async function getClientById(id: number) {
    return db.client.findUnique({
        where: { id },
        include: {
            orders: true // Optional: include associated orders
        }
    });
}