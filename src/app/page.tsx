import { redirect } from "next/navigation";
import api from "@/api";

// Queremos que esta página sea estática, nos encargaremos de revalidar los datos cuando agreguemos un nuevo mensaje
export const dynamic = "force-static";

export default async function HomePage() {
  const messages = await api.message.list();

  // Función para agregar el mensaje (usando el ID del mensaje seleccionado)
  async function add(formData: FormData) {
    "use server";

    const messageId = formData.get("messageId") as string;  // Obtener el ID del mensaje seleccionado
    const url = await api.message.submit(messageId);  // Enviar el ID al backend

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      <form action={add} className="grid gap-2">
        {/* Tabla para seleccionar un mensaje con checkbox */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Seleccionar</th>
              <th className="border p-2">CPE</th>
              <th className="border p-2">Fecha Vto</th>
              <th className="border p-2">Pagada?</th>
              <th className="border p-2">Importe</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id}>
                <td className="border p-2">
                  <input
                    type="radio"
                    name="messageId"
                    value={message.id} // El valor del radio es el ID del mensaje
                    required // Hacerlo obligatorio para seleccionar uno
                  />
                </td>
                <td className="border p-2">{message.cpe}</td>
                <td className="border p-2">{message.fecha_vto}</td>
                <td className="border p-2">{message.pagada=="si" ? "Sí" : "No"}</td>
                <td className="border p-2">{message.importe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="rounded bg-blue-400 p-2 mt-4" type="submit">
          Pagar
        </button>
      </form>
    </section>
  );
}
