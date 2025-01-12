import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Preference} from "mercadopago";

interface Message {
  id: number;
  cpe: string;
  fecha_vto: string;
  pagada: string;
  importe: number;
}

function generarRandom() {
  function generarParte(longitud: number) {
      const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let resultado = '';
      for (let i = 0; i < longitud; i++) {
          const aleatorio = Math.floor(Math.random() * caracteres.length);
          resultado += caracteres.charAt(aleatorio);
      }
      return resultado;
  }

  // Generar las partes con las longitudes especificadas
  const parte1 = generarParte(9); // 9 caracteres numéricos
  const parte2 = generarParte(8); // 8 caracteres alfanuméricos
  const parte3 = generarParte(4); // 4 caracteres alfanuméricos
  const parte4 = generarParte(4); // 4 caracteres alfanuméricos
  const parte5 = generarParte(4); // 4 caracteres alfanuméricos
  const parte6 = generarParte(12); // 12 caracteres alfanuméricos

  // Unir las partes con el formato deseado
  return `${parte1}-${parte2}-${parte3}-${parte4}-${parte5}-${parte6}`;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Leemos el archivo de la base de datos de los mensajes
      const db = readFileSync("db/message.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
    },
    async update(messageId: string): Promise<void> {
      // Obtenemos los mensajes actuales desde la base de datos
      const db = await api.message.list();
      console.log(messageId)
      // Buscamos el índice del mensaje con el id proporcionado
      const messageIndex = db.findIndex((message) => message.id === Number(messageId));
    
      // Si no encontramos el mensaje con ese id, lanzamos un error
      if (messageIndex === -1) {
        throw new Error("Message not found");
      }
    
      // Actualizamos el mensaje en el índice encontrado
      db[messageIndex].pagada = "si";
    
      // Guardamos los datos actualizados en la base de datos
      writeFileSync("db/message.db", JSON.stringify(db, null, 2));
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Si ya existe un mensaje con ese id, lanzamos un error
      if (db.some((_message) => _message.id === message.id)) {
        throw new Error("Message already added");
      }

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
    },
    
    async submit(messageId: string) {
      // console.log(messageId)
      // Obtenemos los mensajes actuales desde la base de datos
      const db = await api.message.list();

      // Buscamos el mensaje correspondiente al messageId
      const message = db.find((msg) => msg.id === Number(messageId));

      // Si no encontramos el mensaje con ese id, lanzamos un error
      if (!message) {
        throw new Error("Message not found");
      }
      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(mercadopago).create({
        body: {
          items: [
            {
              id: messageId,
              unit_price: message.importe,
              quantity: 1,
              title: message.cpe,
            },
          ],
          metadata: {
            uudi: generarRandom(),
            messageId
          },
          notification_url: "https://nf85s26r-3000.brs.devtunnels.ms/api/mercadopago",
          purpose: "wallet_purchase",
          auto_return: 'all',
          back_urls: {
            success: "localhost:3000",
            failure: "localhost:3000",
            pending: "localhost:3000",
          }
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;
