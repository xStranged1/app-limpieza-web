import SupportForm from "@/components/SupportForm";

export default function Support() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-foreground">Soporte</h1>
                    <p className="text-muted-foreground mt-2">LimpiezaON - Centro de ayuda</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Intro */}
                    <section className="prose prose-invert max-w-none">
                        <p className="text-foreground text-lg leading-relaxed">
                            Si tienes problemas con la aplicación o necesitas ayuda, aquí encontrarás cómo contactarnos
                            y resolver las dudas más comunes sobre LimpiezaON.
                        </p>
                    </section>

                    {/* Contacto */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Contacto</h2>
                        </div>

                        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                            <div className="bg-background rounded p-4 border border-border">
                                <p className="font-semibold text-foreground text-sm mb-1">Correo electrónico</p>
                                <p className="text-muted-foreground text-sm">
                                    fede.valle04@gmail.com
                                </p>
                            </div>

                            <p className="text-muted-foreground text-sm">
                                Tiempo de respuesta estimado: 24 a 72 horas hábiles.
                            </p>
                        </div>
                    </section>

                    {/* Problemas comunes */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">2. Problemas Comunes</h2>
                        </div>

                        <div className="bg-card rounded-lg p-6 border border-border space-y-4">

                            <div>
                                <h3 className="font-semibold text-foreground mb-2">No puedo iniciar sesión</h3>
                                <p className="text-muted-foreground text-sm">
                                    Verifica que tu email y contraseña sean correctos. Si olvidaste tu contraseña,
                                    utiliza la opción de recuperación desde la pantalla de login.
                                </p>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="font-semibold text-foreground mb-2">No veo mis tareas</h3>
                                <p className="text-muted-foreground text-sm">
                                    Asegúrate de estar dentro de una casa activa y que las tareas hayan sido asignadas
                                    correctamente por un administrador.
                                </p>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="font-semibold text-foreground mb-2">Problemas con asignaciones</h3>
                                <p className="text-muted-foreground text-sm">
                                    Verifica la configuración de sectores y usuarios dentro de la casa. Si el problema
                                    persiste, contáctanos con detalles.
                                </p>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="font-semibold text-foreground mb-2">Error en la aplicación</h3>
                                <p className="text-muted-foreground text-sm">
                                    Intenta cerrar y volver a abrir la app. Si el error continúa, envíanos una
                                    descripción del problema junto con capturas de pantalla.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Solicitudes */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">3. Solicitudes</h2>
                        </div>

                        <div className="bg-card rounded-lg p-6 border border-border space-y-3 text-muted-foreground">
                            <p>Puedes contactarnos para:</p>
                            <ul className="space-y-2">
                                <li>Reportar errores o fallos</li>
                                <li>Solicitar nuevas funcionalidades</li>
                                <li>Recuperar acceso a tu cuenta</li>
                                <li>Solicitar eliminación de tu cuenta</li>
                                <li>Consultar sobre privacidad y datos</li>
                            </ul>
                        </div>
                    </section>

                    {/* Datos útiles */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Información útil al contactar</h2>
                        </div>

                        <div className="bg-card rounded-lg p-6 border border-border space-y-3 text-muted-foreground">
                            <p>Para ayudarte más rápido, incluye:</p>
                            <ul className="space-y-2">
                                <li>Email de tu cuenta</li>
                                <li>Descripción clara del problema</li>
                                <li>Pasos para reproducir el error</li>
                                <li>Capturas de pantalla (si aplica)</li>
                                <li>Dispositivo y versión del sistema</li>
                            </ul>
                        </div>
                    </section>

                    <SupportForm />
                    {/* Footer */}
                    <div className="border-t border-border pt-8 mt-12">
                        <p className="text-center text-muted-foreground text-sm">
                            <strong>LimpiezaON</strong> - Organiza tu hogar, simplifica tu vida.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}