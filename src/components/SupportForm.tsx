import { useState } from "react";

export default function SupportForm() {
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        comentario: ""
    });

    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("entry.712398800", form.nombre); // reemplazar
        formData.append("entry.1017630243", form.email); // reemplazar
        formData.append("entry.1160067577", form.comentario); // reemplazar

        await fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSdzY7jAdnt1DdISARMXslz06_WF20M_tRsiz1BXZYtMGJHFFw/formResponse", {
            method: "POST",
            mode: "no-cors",
            body: formData,
        });

        setLoading(false);
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Form */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">Contacto</h2>
                        </div>

                        <div className="bg-card rounded-lg p-6 border border-border">
                            {sent ? (
                                <p className="text-muted-foreground">
                                    Tu mensaje fue enviado correctamente.
                                </p>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        className="w-full p-3 rounded bg-background border border-border text-foreground"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        required
                                    />

                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full p-3 rounded bg-background border border-border text-foreground"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />

                                    <textarea
                                        placeholder="Comentario"
                                        className="w-full p-3 rounded bg-background border border-border text-foreground"
                                        rows={4}
                                        value={form.comentario}
                                        onChange={(e) => setForm({ ...form, comentario: e.target.value })}
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded"
                                        disabled={loading}
                                    >
                                        {loading ? "Enviando..." : "Enviar"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}