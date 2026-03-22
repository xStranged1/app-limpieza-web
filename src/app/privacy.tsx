export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-foreground">Política de Privacidad</h1>
                    <p className="text-muted-foreground mt-2">ToDoClean - Última actualización: Marzo 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Intro */}
                    <section className="prose prose-invert max-w-none">
                        <p className="text-foreground text-lg leading-relaxed">
                            ToDoClean se compromete a proteger tu privacidad. Esta Política de Privacidad explica cómo
                            recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra aplicación.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Información que Recopilamos</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">Recopilamos únicamente:</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary font-bold mt-1">•</span>
                                        <span><strong className="text-foreground">Email</strong>: Para crear tu cuenta y autenticación</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary font-bold mt-1">•</span>
                                        <span><strong className="text-foreground">Nombre para mostrar</strong>: Para identificarte en las casas y tareas</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary font-bold mt-1">•</span>
                                        <span><strong className="text-foreground">Datos de actividad</strong>: Información sobre tareas asignadas, completadas y verificadas</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="font-semibold text-foreground mb-2">No recopilamos:</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-3">
                                        <span className="text-muted-foreground font-bold mt-1">✗</span>
                                        <span>Información de ubicación</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-muted-foreground font-bold mt-1">✗</span>
                                        <span>Datos de contactos</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-muted-foreground font-bold mt-1">✗</span>
                                        <span>Historial de navegación fuera de la aplicación</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-muted-foreground font-bold mt-1">✗</span>
                                        <span>Información financiera o de pago</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-muted-foreground font-bold mt-1">✗</span>
                                        <span>Datos biométricos</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">2. Cómo Usamos tu Información</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border">
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>Crear y mantener tu cuenta</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>Permitirte crear y gestionar casas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>Facilitar la asignación y seguimiento de tareas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>Generar historial de actividades</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>Mejorar la funcionalidad y experiencia de la aplicación</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>Cumplir con obligaciones legales</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">3. Compartir de Información</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                            <div>
                                <p className="font-semibold text-foreground mb-3">Tu información se comparte únicamente:</p>
                                <div className="space-y-3">
                                    <div className="bg-background rounded p-4 border border-border">
                                        <p className="font-semibold text-primary text-sm mb-1">CON OTROS MIEMBROS DE TU CASA</p>
                                        <p className="text-muted-foreground text-sm">Tu nombre, rol y tareas asignadas/completadas son visibles a los demás miembros de la casa</p>
                                    </div>
                                    <div className="bg-background rounded p-4 border border-border">
                                        <p className="font-semibold text-primary text-sm mb-1">NO CON TERCEROS</p>
                                        <p className="text-muted-foreground text-sm">No vendemos, alquilamos ni compartimos tu información personal con empresas externas</p>
                                    </div>
                                    <div className="bg-background rounded p-4 border border-border">
                                        <p className="font-semibold text-primary text-sm mb-1">EXCEPTO POR LEY</p>
                                        <p className="text-muted-foreground text-sm">Si la ley lo requiere, podemos revelar información según lo exija una autoridad competente</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Seguridad de Datos</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border space-y-2">
                            <p className="text-muted-foreground flex items-start gap-3">
                                <span className="text-primary font-bold mt-1">🔐</span>
                                <span>Todos los datos se almacenan en servidores seguros de Firebase (Google Cloud)</span>
                            </p>
                            <p className="text-muted-foreground flex items-start gap-3">
                                <span className="text-primary font-bold mt-1">🔐</span>
                                <span>Las comunicaciones entre la aplicación y nuestros servidores están encriptadas (HTTPS)</span>
                            </p>
                            <p className="text-muted-foreground flex items-start gap-3">
                                <span className="text-primary font-bold mt-1">🔐</span>
                                <span>Protegemos tu contraseña mediante estándares de encriptación de la industria</span>
                            </p>
                            <p className="text-muted-foreground flex items-start gap-3">
                                <span className="text-primary font-bold mt-1">🔐</span>
                                <span>No almacenamos contraseñas en texto plano</span>
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Retención de Datos</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border space-y-3 text-muted-foreground">
                            <p>Mantenemos tu información mientras tu cuenta esté activa</p>
                            <p>Si eliminas tu cuenta, tus datos personales se borran permanentemente</p>
                            <p>El historial de tareas puede retenerse para propósitos de auditoría de la casa, pero se disociará de tu información personal</p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">6. Tus Derechos</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border">
                            <p className="text-muted-foreground mb-4">Tienes derecho a:</p>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div className="bg-background rounded p-4 border border-border">
                                    <p className="font-semibold text-foreground text-sm mb-1">Acceder</p>
                                    <p className="text-muted-foreground text-sm">a tu información personal</p>
                                </div>
                                <div className="bg-background rounded p-4 border border-border">
                                    <p className="font-semibold text-foreground text-sm mb-1">Corregir</p>
                                    <p className="text-muted-foreground text-sm">datos incorrectos</p>
                                </div>
                                <div className="bg-background rounded p-4 border border-border">
                                    <p className="font-semibold text-foreground text-sm mb-1">Solicitar eliminación</p>
                                    <p className="text-muted-foreground text-sm">de tu cuenta y datos asociados</p>
                                </div>
                                <div className="bg-background rounded p-4 border border-border">
                                    <p className="font-semibold text-foreground text-sm mb-1">Exportar</p>
                                    <p className="text-muted-foreground text-sm">tu información en formato accesible</p>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm mt-4">
                                Para ejercer estos derechos, contacta a través del formulario de soporte en la aplicación.
                            </p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">7. Menores de Edad</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border space-y-3 text-muted-foreground">
                            <p>ToDoClean no está destinado a menores de 13 años. No recopilamos información de menores de edad de forma intencional.</p>
                            <p>Si descubrimos que hemos recopilado información de un menor, tomaremos medidas para eliminarla inmediatamente.</p>
                            <p>Si eres padre/tutor de un menor y crees que ha compartido información con nosotros, por favor contacta de inmediato.</p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">8. Cambios a esta Política</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border text-muted-foreground">
                            <p>Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cambios significativos a través de un aviso en la aplicación. Tu uso continuado de ToDoClean después de cambios significa que aceptas la política actualizada.</p>
                        </div>
                    </section>

                    {/* Section 9 - Contact */}
                    <section className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-bold text-foreground">9. Contacto</h2>
                        </div>
                        <div className="bg-card rounded-lg p-6 border border-border">
                            <p className="text-muted-foreground mb-4">Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos:</p>
                            <div className="space-y-3">
                                <div className="bg-background rounded p-4 border border-border">
                                    <p className="font-semibold text-foreground text-sm mb-1">📱 A través de la aplicación</p>
                                    <p className="text-muted-foreground text-sm">Usa el formulario de soporte en la sección de Configuración</p>
                                </div>
                                <div className="bg-background rounded p-4 border border-border">
                                    <p className="font-semibold text-foreground text-sm mb-1">📧 Por correo electrónico</p>
                                    <p className="text-muted-foreground text-sm">fede.valle04@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="border-t border-border pt-8 mt-12">
                        <p className="text-center text-muted-foreground text-sm">
                            <strong>ToDoClean</strong> - Organiza tu hogar, simplifica tu vida.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}